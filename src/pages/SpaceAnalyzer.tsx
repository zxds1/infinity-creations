import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Paintbrush, Upload, Sparkles, RefreshCw, ChevronRight, Share2, Crop, Check, X, Send, Play, Video, Plus, Trash2, Truck, Bike, Home, Package, Heart, ShoppingBag, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { analyzeSpace } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import Cropper from 'react-easy-crop';
import { auth, db, collection, addDoc, serverTimestamp, handleFirestoreError, OperationType, getDocs } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import Tooltip from '../components/Tooltip';
import { extractDesignPreferences, getProductInsightLabels, getProductPreferenceScore, getStoredPreferences, saveStoredPreferences, trackEvent } from '../lib/behavior';
import { defaultSiteContent, fetchSiteContent, type SiteContent } from '../lib/siteContent';

const serviceIconMap: Record<string, typeof Paintbrush> = {
  Truck,
  Bike,
  Paintbrush,
  Camera,
  Home,
  Package,
  Heart,
  ShoppingBag,
  Zap,
  Sparkles
};
const getServiceIcon = (icon?: string) => serviceIconMap[icon || ''] || Paintbrush;

export default function SpaceAnalyzer() {
  const [searchParams] = useSearchParams();
  const [mediaFiles, setMediaFiles] = useState<{ type: 'image' | 'video', data: string }[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [editingMediaIndex, setEditingMediaIndex] = useState<number | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [briefText, setBriefText] = useState("");
  const [refinementText, setRefinementText] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefilledBriefRef = useRef(false);

  useEffect(() => {
    Promise.all([
      getDocs(collection(db, 'products')),
      fetchSiteContent()
    ])
      .then(([snapshot, siteContent]) => {
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setContent(siteContent);
        setSelectedServiceId(current => {
          if (current) return current;
          const requestedService = searchParams.get('service') || '';
          const requestedCategory = searchParams.get('category') || '';
          const matched = siteContent.services.find(service =>
            service.id === requestedService ||
            service.title.toLowerCase() === requestedService.toLowerCase() ||
            service.category.toLowerCase() === requestedCategory.toLowerCase() ||
            (requestedCategory && service.search.toLowerCase().includes(requestedCategory.toLowerCase()))
          );
          return matched?.id || siteContent.services[0]?.id || '';
        });
      })
      .catch(() => undefined);

    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (prefilledBriefRef.current) return;
    const product = searchParams.get('product');
    const category = searchParams.get('category');
    const idea = searchParams.get('idea');
    const price = searchParams.get('price');
    if (!product && !idea) return;

    const lines = [
      product ? `I want to customize: ${product}.` : '',
      category ? `Category: ${category}.` : '',
      price ? `Starting price seen in Explore: KSH ${price}.` : '',
      idea ? `Style or order notes: ${idea}.` : '',
      'Recommend options I can choose from before ordering.'
    ].filter(Boolean);
    setBriefText(lines.join('\n'));
    prefilledBriefRef.current = true;
  }, [searchParams]);

  const matchedProducts = result
    ? products
        .slice()
        .sort((a, b) => getProductPreferenceScore(b, getStoredPreferences()) - getProductPreferenceScore(a, getStoredPreferences()))
        .slice(0, 3)
    : [];

  const creationIntent = content.categories[0];
  const activeServices = content.services || [];
  const selectedService = activeServices.find(service => service.id === selectedServiceId) || activeServices[0];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      toast.error("Camera access denied");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setMediaFiles(prev => [...prev, { type: 'image', data: dataUrl }]);
      toast.success("Snapshot captured!");
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return "";

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/jpeg');
  };

  const handleCrop = async () => {
    try {
      if (editingMediaIndex !== null && croppedAreaPixels) {
        const targetImage = mediaFiles[editingMediaIndex].data;
        const cropped = await getCroppedImg(targetImage, croppedAreaPixels);
        
        const newMediaFiles = [...mediaFiles];
        newMediaFiles[editingMediaIndex] = { ...newMediaFiles[editingMediaIndex], data: cropped };
        setMediaFiles(newMediaFiles);
        setEditingMediaIndex(null);
        toast.success("Image cropped successfully");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to crop image");
    }
  };

  const startCrop = (index: number) => {
    setEditingMediaIndex(index);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const type = file.type.startsWith('video') ? 'video' : 'image';
        setMediaFiles(prev => [...prev, { type: type as any, data: reader.result as string }]);
        setResult(null);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleShare = async () => {
    if (!result) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Infinity Style Recommendations',
          text: result.substring(0, 500) + '...',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(result);
        toast.success("Recommendations copied to clipboard!");
      } catch (err) {
        toast.error("Could not copy to clipboard");
      }
    }
  };

  const [analysisStatus, setAnalysisStatus] = useState("Understanding your request...");
  
  const statusMessages = [
    "Understanding your request...",
    "Reading style references...",
    "Evaluating colors and layout...",
    "Matching print and branding options...",
    "Finding suitable materials...",
    "Preparing custom direction...",
    "Choosing matching Infinity services...",
    "Finalizing recommendations..."
  ];

  const runAnalysis = async (refinement?: string) => {
    if (mediaFiles.length === 0 && !briefText.trim() && !refinement?.trim()) return;

    setAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStatus(statusMessages[0]);

    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 95) return 95;
        const next = prev + Math.random() * 5;
        
        // Update status message based on progress
        const msgIndex = Math.floor((next / 100) * statusMessages.length);
        if (statusMessages[msgIndex]) setAnalysisStatus(statusMessages[msgIndex]);
        
        return next;
      });
    }, 500);

    try {
      const isVideo = mediaFiles[0]?.type === 'video';
      const inputs = mediaFiles.length === 0
        ? []
        : isVideo ? mediaFiles[0].data.split(',')[1] : mediaFiles.map(m => m.data.split(',')[1]);
      
      const projectDetails = refinement ?? briefText;
      const serviceContext = selectedService
        ? `${selectedService.category}: ${selectedService.title}. ${selectedService.description}.`
        : `${creationIntent.title}: ${creationIntent.description}.`;
      const promptContext = `${serviceContext} ${projectDetails || ''}`.trim();
      const recommendations = await analyzeSpace(inputs, promptContext, isVideo);
      const preferences = extractDesignPreferences(recommendations, promptContext);
      saveStoredPreferences(preferences);
      trackEvent({
        eventType: 'analyzer',
        metadata: {
          mediaCount: mediaFiles.length,
          preferences,
          refinement: Boolean(refinement),
          creationIntent: creationIntent.title,
          selectedService: selectedService?.title || null
        }
      }).catch(() => undefined);
      setAnalysisProgress(100);
      
      setTimeout(() => {
        setResult(recommendations);
        setAnalyzing(false);
        setAnalysisProgress(0);
        if (refinement) setRefinementText("");
      }, 600);

      if (auth.currentUser) {
        try {
          await addDoc(collection(db, 'designRequests'), {
            userId: auth.currentUser.uid,
            mediaCount: mediaFiles.length,
            prompt: promptContext,
            serviceId: selectedService?.id || null,
            serviceName: selectedService?.title || null,
            recommendations,
            preferences,
            status: "completed",
            createdAt: serverTimestamp()
          });
        } catch (err) {
          try {
            handleFirestoreError(err, OperationType.WRITE, 'designRequests');
          } catch {
            toast.error("Analysis saved locally, but cloud history was unavailable");
          }
        }
      } else if (typeof window !== 'undefined') {
        const existing = JSON.parse(window.localStorage.getItem('infinity.demoDesignRequests') || '[]');
        window.localStorage.setItem('infinity.demoDesignRequests', JSON.stringify([
          {
            mediaCount: mediaFiles.length,
            prompt: promptContext,
            serviceId: selectedService?.id || null,
            serviceName: selectedService?.title || null,
            recommendations,
            preferences,
            status: 'completed',
            createdAt: new Date().toISOString()
          },
          ...existing
        ].slice(0, 20)));
      }
    } catch (error) {
      console.error(error);
      toast.error("Analysis failed. Please try again.");
      setAnalyzing(false);
      setAnalysisProgress(0);
    } finally {
      clearInterval(interval);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 py-8 sm:px-4 md:py-12">
      {/* Cropping Modal */}
      <AnimatePresence>
        {editingMediaIndex !== null && mediaFiles[editingMediaIndex] && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-stone-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-4"
          >
            <div className="relative w-full max-w-4xl aspect-square bg-stone-800 rounded-3xl overflow-hidden">
              <Cropper
                image={mediaFiles[editingMediaIndex].data}
                crop={crop}
                zoom={zoom}
                aspect={4/3}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="mt-8 flex gap-4 w-full max-w-md">
              <button 
                onClick={() => setEditingMediaIndex(null)}
                className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleCrop}
                className="flex-1 py-4 bg-brand-primary text-brand-cream rounded-2xl font-bold shadow-xl shadow-brand-primary/20 hover:scale-105 transition-all"
              >
                Apply Crop
              </button>
            </div>

            <div className="mt-8 w-full max-w-xs">
              <input 
                type="range" 
                min="1" 
                max="3" 
                step="0.1" 
                value={zoom} 
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-brand-primary"
              />
              <p className="text-center text-xs text-stone-400 mt-2 uppercase tracking-widest">Zoom Control</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-8 md:mb-12">
        <h1 className="mb-3 text-4xl italic font-light leading-none md:mb-4 md:text-6xl">{content.customizeTitle}</h1>
        <p className="text-stone-500 text-sm max-w-2xl mx-auto leading-relaxed md:text-lg">
          {content.customizeSubtitle}
        </p>
      </div>

      <section className="mb-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-brand-primary">Step 1</p>
            <h2 className="mt-2 text-2xl font-serif text-stone-900 md:text-3xl">What are you creating?</h2>
          </div>
          <span className="hidden text-[10px] font-black uppercase tracking-widest text-stone-400 sm:inline">
            Managed in Admin
          </span>
        </div>
        {activeServices.length === 0 ? (
          <div className="rounded-[24px] border border-stone-100 bg-white p-6 text-sm text-stone-400">
            No services are active yet. Add services from Admin to show them here.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {activeServices.map(service => {
              const Icon = getServiceIcon(service.icon);
              const selected = selectedService?.id === service.id;
              return (
                <button
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`group flex min-h-28 items-start gap-4 rounded-[24px] p-5 text-left transition-all ${selected ? 'bg-stone-900 text-white shadow-xl shadow-stone-900/10' : 'bg-white text-stone-900 shadow-sm hover:-translate-y-1 hover:shadow-md'}`}
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${selected ? 'bg-white/10 text-brand-cream' : 'bg-brand-primary/5 text-brand-primary group-hover:bg-brand-primary group-hover:text-brand-cream'}`}>
                    <Icon size={21} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold">{service.title}</span>
                    <span className={`mt-1 block text-sm leading-relaxed ${selected ? 'text-white/65' : 'text-stone-500'}`}>{service.description}</span>
                    <span className={`mt-3 block text-[10px] font-black uppercase tracking-widest ${selected ? 'text-white/40' : 'text-stone-400'}`}>{service.category}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Media Intake Side */}
        <div className="space-y-6 md:space-y-8">
          <div className="bg-white rounded-[28px] border border-stone-100 p-4 shadow-sm md:rounded-[40px] md:p-8">
            <div className="mb-5 md:mb-8">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-brand-primary">Step 2</p>
              <h2 className="mt-2 text-2xl font-serif text-stone-900">Tell us your style</h2>
              <p className="mt-2 text-sm text-stone-400">Step 3: Add details, upload your idea, or use the Explore item already loaded here.</p>
            </div>
            <div className="flex gap-3 mb-5 md:gap-4 md:mb-8">
              <Tooltip content="Upload your idea">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border border-stone-100 bg-stone-50 text-stone-500 transition-all hover:bg-brand-primary hover:text-white md:h-16 md:w-16"
                >
                  <Upload size={24} />
                </button>
              </Tooltip>
              <Tooltip content={isCameraActive ? "Stop Camera" : "Live Camera"}>
                <button 
                  onClick={isCameraActive ? stopCamera : startCamera}
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl border transition-all md:h-16 md:w-16 ${isCameraActive ? 'bg-red-50 border-red-100 text-red-500' : 'bg-stone-50 border-stone-100 text-stone-500 hover:bg-brand-primary hover:text-white'}`}
                >
                  <Camera size={24} />
                </button>
              </Tooltip>
              {isCameraActive && (
                <Tooltip content="Capture Snapshot">
                  <button 
                    onClick={captureFrame}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary text-brand-cream shadow-lg animate-pulse md:h-16 md:w-16"
                  >
                    <Plus size={24} />
                  </button>
                </Tooltip>
              )}
            </div>

            <div className="mb-5 md:mb-8">
              <textarea
                value={briefText}
                onChange={(event) => setBriefText(event.target.value)}
                placeholder="Describe the item, style, colors, size, wording, or business name..."
                className="min-h-[112px] w-full rounded-[24px] border border-stone-100 bg-stone-50 p-5 text-sm outline-none focus:border-brand-primary focus:bg-white"
              />
            </div>

            <div className="aspect-[4/3] bg-stone-900 rounded-[24px] overflow-hidden relative group md:aspect-video md:rounded-[32px]">
              {isCameraActive ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              ) : mediaFiles.length > 0 ? (
                <div className="w-full h-full bg-stone-100 overflow-hidden">
                  {mediaFiles[0].type === 'video' ? (
                    <video src={mediaFiles[0].data} controls className="w-full h-full object-cover" />
                  ) : (
                    <img src={mediaFiles[0].data} className="w-full h-full object-cover" />
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-500 gap-4">
                  <Video size={48} className="opacity-20" />
                  <span className="max-w-xs text-center text-sm font-medium uppercase tracking-widest opacity-40">Add a reference photo or run from your brief</span>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Media Gallery */}
            <div className="mt-5 grid auto-cols-[72px] grid-flow-col gap-3 overflow-x-auto pb-3 scrollbar-hide md:mt-8 md:grid-cols-4 md:grid-flow-row md:gap-4">
              {mediaFiles.map((file, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="aspect-square rounded-2xl bg-stone-100 relative group overflow-hidden border border-stone-200"
                >
                  {file.type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-stone-800 text-white"><Play size={16} /></div>
                  ) : (
                    <>
                      <img src={file.data} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => startCrop(idx)}
                        className="absolute bottom-2 right-2 p-2 bg-white/20 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white/40"
                      >
                        <Crop size={14} />
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => removeMedia(idx)}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              ))}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept="image/*,video/*"
              multiple
            />
          </div>

          <AnimatePresence>
            {analyzing && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 space-y-2 overflow-hidden"
              >
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-stone-400">
                  <span>{analysisStatus}</span>
                  <span>{Math.round(analysisProgress)}%</span>
                </div>
                <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${analysisProgress}%` }}
                    className="h-full bg-brand-primary"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => runAnalysis()}
            disabled={(mediaFiles.length === 0 && !briefText.trim()) || analyzing}
            className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all relative overflow-hidden md:py-5 md:text-lg ${analyzing ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200' : 'bg-brand-primary text-brand-cream hover:shadow-2xl hover:shadow-brand-primary/20 shadow-lg active:scale-[0.98]'}`}
          >
            {analyzing && (
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${analysisProgress}%` }}
                className="absolute left-0 top-0 bottom-0 bg-brand-primary/10 transition-all duration-300 pointer-events-none"
              />
            )}
            <div className="relative z-10 flex items-center justify-center gap-3">
              {analyzing ? (
                <RefreshCw className="animate-spin" size={24} />
              ) : (
                <Sparkles size={24} />
              )}
              {analyzing ? `Preparing your options... ${Math.round(analysisProgress)}%` : 'Get design direction'}
            </div>
          </button>

          <p className="text-sm text-center text-stone-400 italic">Your design direction is saved in this demo browser.</p>
        </div>

        {/* Results Side */}
        <div className="bg-white rounded-[28px] border border-brand-primary/10 min-h-[420px] flex flex-col relative overflow-hidden shadow-sm md:min-h-[500px] md:rounded-[40px]">
          <AnimatePresence mode="wait">
            {analyzing ? (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-12 text-center"
              >
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-brand-primary/10 border-t-brand-primary animate-spin" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-primary" size={32} />
                </div>
                <div>
                  <h3 className="text-2xl mb-2 font-serif">Reading your brief...</h3>
                  <p className="text-stone-400 italic">We are looking at your reference, style, colors, and project type.</p>
                </div>
              </motion.div>
            ) : result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 overflow-y-auto max-h-none md:p-10 md:max-h-[80vh]"
              >
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-2 text-brand-primary font-bold uppercase tracking-[0.2em] text-xs">
                    <Sparkles size={14} /> Here's what we recommend for you
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleShare}
                      className="p-2 rounded-full hover:bg-stone-50 text-stone-400 transition-colors"
                      title="Share Recommendations"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="prose prose-stone max-w-none prose-p:leading-relaxed prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:font-serif">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>

                {matchedProducts.length > 0 && (
                  <div className="mt-8 border-t border-stone-100 pt-8 md:mt-12 md:pt-10">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-xl font-serif text-stone-900">Suggested services and custom options</h4>
                        <p className="text-sm text-stone-400">Chosen from what you are creating, your style, and your details.</p>
                      </div>
                      <Link to="/shop" className="text-[10px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-2">
                        Explore options <ChevronRight size={14} />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {matchedProducts.map((product, index) => (
                        <Link key={product.id} to={`/shop?query=${encodeURIComponent(product.name)}`} className="group flex gap-4 rounded-3xl bg-stone-50 p-4 text-left hover:bg-white hover:shadow-sm">
                          <img src={product.image} alt={product.name} className="h-24 w-24 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                          <div className="min-w-0 flex-1 py-1">
                            <h5 className="truncate font-bold text-stone-900">{product.name}</h5>
                            <p className="mt-1 text-sm font-bold text-brand-primary">KSH {product.price}</p>
                            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-stone-400">
                              {getProductInsightLabels(product, getStoredPreferences(), index)[0]}
                            </p>
                          </div>
                          <ChevronRight size={18} className="mt-2 text-stone-300 group-hover:text-brand-primary" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Refinement Section */}
                <div className="mt-12 pt-10 border-t border-stone-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/5 flex items-center justify-center text-brand-primary">
                      <RefreshCw size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Refine the direction</h4>
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest">Tailor your results further</p>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea 
                      value={refinementText}
                      onChange={(e) => setRefinementText(e.target.value)}
                      placeholder="e.g., 'make it premium', 'use blue and white', 'for a salon banner'..."
                      className="w-full bg-stone-50 border border-stone-100 rounded-[32px] p-6 pr-16 text-sm focus:outline-brand-primary min-h-[140px] shadow-inner transition-all focus:bg-white"
                    />
                    <button 
                      onClick={() => runAnalysis(refinementText)}
                      disabled={!refinementText.trim() || analyzing}
                      className="absolute bottom-6 right-6 w-12 h-12 rounded-2xl bg-brand-primary text-brand-cream flex items-center justify-center shadow-xl disabled:opacity-50 hover:scale-110 transition-all hover:bg-stone-900"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>

                <div className="mt-12 bg-brand-primary/5 p-8 rounded-3xl border border-brand-primary/10">
                  <h4 className="text-xl mb-4 font-serif text-brand-primary">Ready to make it?</h4>
                  <p className="text-stone-600 mb-6 text-sm">Send the request and Infinity can design, print, or brand the final piece for you.</p>
                  <div className="flex flex-wrap gap-3">
                    <Link to="/cart" className="bg-brand-primary text-brand-cream px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2">
                      Proceed with this design <ChevronRight size={16} />
                    </Link>
                    <Link to="/shop" className="bg-white text-stone-700 px-6 py-3 rounded-full text-sm font-bold border border-stone-200">
                      Request custom design
                    </Link>
                    <button
                      onClick={() => toast.success('Saved for later.')}
                      className="bg-white text-stone-700 px-6 py-3 rounded-full text-sm font-bold border border-stone-200"
                    >
                      Save for later
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 p-12 text-center text-stone-300">
                <Sparkles size={64} className="mb-6 opacity-20" />
                <p className="text-lg">Choose a project type and upload a reference <br />to see your recommendations here.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
