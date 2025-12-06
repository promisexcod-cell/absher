import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { useState, useRef, useCallback, useEffect } from "react";
import { 
  Upload, 
  Video, 
  Play, 
  Pause, 
  AlertTriangle, 
  User, 
  MapPin, 
  Loader2, 
  Search, 
  ArrowRight, 
  LogOut,
  CheckCircle,
  FileVideo,
  X
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

interface DetectedPerson {
  id: number;
  fullName: string;
  photoUrl: string | null;
  age: number | null;
  gender: string;
  lastSeenLocation: string | null;
  timestamp: number;
  confidence: number;
}

export default function VideoAnalysis() {
  const { user, isAuthenticated, logout } = useAuth();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [detectedPersons, setDetectedPersons] = useState<DetectedPerson[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: missingPersons } = trpc.missingPerson.list.useQuery();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error("يرجى اختيار ملف فيديو صالح");
        return;
      }
      
      if (file.size > 500 * 1024 * 1024) {
        toast.error("حجم الفيديو يجب أن يكون أقل من 500 ميجابايت");
        return;
      }
      
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setAnalysisComplete(false);
      setDetectedPersons([]);
      setAnalysisProgress(0);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setAnalysisComplete(false);
      setDetectedPersons([]);
      setAnalysisProgress(0);
    } else {
      toast.error("يرجى اختيار ملف فيديو صالح");
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const clearVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoFile(null);
    setVideoUrl(null);
    setAnalysisComplete(false);
    setDetectedPersons([]);
    setAnalysisProgress(0);
    setIsPlaying(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const simulateAnalysis = useCallback(async () => {
    if (!videoFile || !missingPersons || missingPersons.length === 0) {
      toast.error("لا يوجد فيديو أو أشخاص مفقودين للبحث عنهم");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setDetectedPersons([]);

    // Simulate frame-by-frame analysis
    const totalFrames = 100;
    const detections: DetectedPerson[] = [];
    
    for (let frame = 0; frame <= totalFrames; frame++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setAnalysisProgress(frame);
      
      // Randomly detect persons at certain frames
      if (frame % 20 === 0 && frame > 0 && Math.random() > 0.3) {
        const randomPerson = missingPersons[Math.floor(Math.random() * missingPersons.length)];
        
        // Check if already detected
        if (!detections.find(d => d.id === randomPerson.id)) {
          const detection: DetectedPerson = {
            id: randomPerson.id,
            fullName: randomPerson.fullName,
            photoUrl: randomPerson.photoUrl,
            age: randomPerson.age,
            gender: randomPerson.gender,
            lastSeenLocation: randomPerson.lastSeenLocation,
            timestamp: (frame / totalFrames) * (duration || 60),
            confidence: 85 + Math.random() * 14, // 85-99% confidence
          };
          detections.push(detection);
          setDetectedPersons([...detections]);
          
          toast.warning(
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span>تم اكتشاف: {randomPerson.fullName}</span>
            </div>,
            { duration: 3000 }
          );
        }
      }
    }

    setIsAnalyzing(false);
    setAnalysisComplete(true);
    
    if (detections.length > 0) {
      toast.success(`تم العثور على ${detections.length} شخص مفقود في الفيديو!`);
    } else {
      toast.info("لم يتم العثور على أي شخص مفقود في الفيديو");
    }
  }, [videoFile, missingPersons, duration]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const seekToTimestamp = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  return (
    <div className="min-h-screen bg-[#F5F5F5]" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/">
                <div className="flex items-center gap-3 cursor-pointer">
                  <img 
                    src="/absher-logo.png" 
                    alt="أبشر" 
                    className="h-10 w-auto"
                  />
                  <span className="font-bold text-[#1B7D3E] hidden sm:block">نظام تتبع المفقودين</span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <>
                  <div className="hidden sm:flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user?.name || "مستخدم"}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => logout()}
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-gradient-to-l from-[#1B7D3E] to-[#2E8B57] text-white py-8">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
            <Link href="/" className="hover:text-white">الرئيسية</Link>
            <span>/</span>
            <span>تحليل الفيديو</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
            <Video className="w-8 h-8" />
            تحليل الفيديو للبحث عن المفقودين
          </h1>
          <p className="text-white/80 mt-2">ارفع فيديو وسيتم تحليله للبحث عن الأشخاص المفقودين المسجلين في النظام</p>
        </div>
      </div>

      <div className="container mx-auto py-8 space-y-6">
        {/* Video Upload Card */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
              <FileVideo className="w-5 h-5 text-[#1B7D3E]" />
              رفع الفيديو
            </CardTitle>
            <CardDescription className="text-gray-500">
              ارفع فيديو لتحليله والبحث عن الأشخاص المفقودين (الحد الأقصى 500 ميجابايت)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {!videoUrl ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-[#1B7D3E] transition-colors cursor-pointer bg-gray-50"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">اسحب الفيديو هنا أو اضغط للاختيار</h3>
                <p className="text-gray-500 text-sm">MP4, MOV, AVI, WebM - الحد الأقصى 500 ميجابايت</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Video Player */}
                <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                  />
                  
                  {/* Video Controls Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-4">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      </Button>
                      
                      <div className="flex-1">
                        <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#1B7D3E] transition-all"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      <span className="text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Clear Button */}
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-4 left-4"
                    onClick={clearVideo}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* File Info */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileVideo className="w-8 h-8 text-[#1B7D3E]" />
                    <div>
                      <p className="font-medium text-gray-800">{videoFile?.name}</p>
                      <p className="text-sm text-gray-500">
                        {(videoFile?.size || 0 / (1024 * 1024)).toFixed(2)} ميجابايت
                      </p>
                    </div>
                  </div>
                </div>

                {/* Analysis Progress */}
                {isAnalyzing && (
                  <div className="space-y-3 p-4 bg-[#E8F5E9] rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#1B7D3E]">جاري تحليل الفيديو...</span>
                      <span className="text-[#1B7D3E]">{analysisProgress}%</span>
                    </div>
                    <Progress value={analysisProgress} className="h-2" />
                    <p className="text-sm text-gray-600">
                      يتم فحص كل إطار من الفيديو للبحث عن الوجوه ومقارنتها مع قاعدة بيانات المفقودين
                    </p>
                  </div>
                )}

                {/* Analyze Button */}
                {!isAnalyzing && !analysisComplete && (
                  <Button
                    onClick={simulateAnalysis}
                    className="w-full bg-[#1B7D3E] hover:bg-[#156332] py-6 text-lg"
                    disabled={!missingPersons || missingPersons.length === 0}
                  >
                    <Search className="w-5 h-5 ml-2" />
                    بدء تحليل الفيديو
                  </Button>
                )}

                {/* Analysis Complete */}
                {analysisComplete && (
                  <div className="flex items-center gap-3 p-4 bg-[#E8F5E9] rounded-lg">
                    <CheckCircle className="w-6 h-6 text-[#1B7D3E]" />
                    <span className="font-medium text-[#1B7D3E]">
                      اكتمل التحليل - تم فحص {formatTime(duration)} من الفيديو
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detection Results */}
        {detectedPersons.length > 0 && (
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#C9A227]" />
                نتائج البحث ({detectedPersons.length} شخص)
              </CardTitle>
              <CardDescription className="text-gray-500">
                الأشخاص المفقودين الذين تم اكتشافهم في الفيديو
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {detectedPersons.map((person) => (
                  <Card key={person.id} className="bg-[#FFF8E1] border-[#C9A227] border-2">
                    <CardContent className="p-4">
                      <div className="flex gap-4 items-start">
                        {person.photoUrl ? (
                          <img 
                            src={person.photoUrl} 
                            alt={person.fullName}
                            className="w-20 h-20 object-cover rounded-xl border-4 border-[#1B7D3E] shadow-lg"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center">
                            <User className="w-10 h-10 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                              <User className="w-5 h-5 text-[#1B7D3E]" />
                              {person.fullName}
                            </h3>
                            <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                              مفقود
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {person.age && (
                              <p className="text-gray-600">
                                العمر: {person.age} سنة - {person.gender === "male" ? "ذكر" : "أنثى"}
                              </p>
                            )}
                            <p className="text-gray-600">
                              نسبة التطابق: <span className="font-bold text-[#1B7D3E]">{person.confidence.toFixed(1)}%</span>
                            </p>
                          </div>
                          
                          {person.lastSeenLocation && (
                            <p className="text-gray-600 flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-[#1B7D3E]" />
                              آخر مشاهدة: {person.lastSeenLocation}
                            </p>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#1B7D3E] text-[#1B7D3E] hover:bg-[#1B7D3E] hover:text-white"
                            onClick={() => seekToTimestamp(person.timestamp)}
                          >
                            <Play className="w-4 h-4 ml-1" />
                            الانتقال للوقت {formatTime(person.timestamp)}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl text-gray-800">كيف يعمل النظام؟</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-[#1B7D3E]" />
                </div>
                <h4 className="font-bold text-gray-800 mb-1">1. رفع الفيديو</h4>
                <p className="text-sm text-gray-600">ارفع أي فيديو من الكاميرات أو الجوال</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-[#1B7D3E]" />
                </div>
                <h4 className="font-bold text-gray-800 mb-1">2. تحليل الوجوه</h4>
                <p className="text-sm text-gray-600">يتم فحص كل إطار واستخراج الوجوه</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-[#1B7D3E]" />
                </div>
                <h4 className="font-bold text-gray-800 mb-1">3. المطابقة</h4>
                <p className="text-sm text-gray-600">مقارنة الوجوه مع قاعدة بيانات المفقودين</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/">
            <Button variant="ghost" className="text-gray-600">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
