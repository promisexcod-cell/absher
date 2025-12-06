import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, CameraOff, AlertTriangle, User, MapPin, Loader2, Search, ArrowRight, LogOut } from "lucide-react";
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
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function Detection() {
  const { user, isAuthenticated, logout } = useAuth();
  const [cameraState, setCameraState] = useState<"off" | "loading" | "on">("off");
  const [detectedPersons, setDetectedPersons] = useState<DetectedPerson[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data: missingPersons } = trpc.missingPerson.list.useQuery();

  const startCamera = useCallback(async () => {
    setCameraState("loading");
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        const handleCanPlay = () => {
          videoRef.current?.play()
            .then(() => {
              setCameraState("on");
              toast.success("تم تشغيل الكاميرا - جاري البحث عن المفقودين");
            })
            .catch((err) => {
              console.error("Error playing video:", err);
              setCameraState("off");
              toast.error("حدث خطأ في تشغيل الفيديو");
            });
          
          videoRef.current?.removeEventListener("canplay", handleCanPlay);
        };
        
        videoRef.current.addEventListener("canplay", handleCanPlay);
      }
    } catch (error) {
      console.error("Camera error:", error);
      setCameraState("off");
      toast.error("لا يمكن الوصول إلى الكاميرا - تأكد من منح الإذن");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    setCameraState("off");
    setDetectedPersons([]);
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  const simulateDetection = useCallback(() => {
    if (!missingPersons || missingPersons.length === 0 || cameraState !== "on") return;
    
    const shouldDetect = Math.random() > 0.7;
    
    if (shouldDetect) {
      const randomPerson = missingPersons[Math.floor(Math.random() * missingPersons.length)];
      
      const displayWidth = videoRef.current?.clientWidth || 640;
      const displayHeight = videoRef.current?.clientHeight || 480;
      
      const boxWidth = 120 + Math.random() * 80;
      const boxHeight = boxWidth * 1.3;
      const x = 50 + Math.random() * (displayWidth - boxWidth - 100);
      const y = 50 + Math.random() * (displayHeight - boxHeight - 100);
      
      const detected: DetectedPerson = {
        id: randomPerson.id,
        fullName: randomPerson.fullName,
        photoUrl: randomPerson.photoUrl,
        age: randomPerson.age,
        gender: randomPerson.gender,
        lastSeenLocation: randomPerson.lastSeenLocation,
        x,
        y,
        width: boxWidth,
        height: boxHeight,
      };
      
      setDetectedPersons([detected]);
      
      toast.warning(
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <span>تم العثور على شخص مفقود: {randomPerson.fullName}</span>
        </div>,
        { duration: 5000 }
      );
    } else {
      setDetectedPersons([]);
    }
  }, [missingPersons, cameraState]);

  useEffect(() => {
    if (cameraState === "on") {
      detectionIntervalRef.current = setInterval(simulateDetection, 3000);
    }
    
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [cameraState, simulateDetection]);

  return (
    <div className="min-h-screen bg-[#F5F5F5]" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/">
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="w-10 h-10 bg-[#1B7D3E] rounded-full flex items-center justify-center">
                    <Search className="w-5 h-5 text-white" />
                  </div>
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
            <span>البحث بالكاميرا</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
            <Camera className="w-8 h-8" />
            نظام البحث عن المفقودين
          </h1>
          <p className="text-white/80 mt-2">افتح الكاميرا للبحث عن الأشخاص المفقودين المسجلين في النظام</p>
        </div>
      </div>

      <div className="container mx-auto py-8 space-y-6">
        {/* Camera Card */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#1B7D3E]" />
              كاميرا البحث
            </CardTitle>
            <CardDescription className="text-gray-500">
              قم بتشغيل الكاميرا لبدء البحث عن المفقودين
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Camera View */}
            <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-200 shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraState === "on" ? "block" : "hidden"}`}
                style={{ transform: "scaleX(-1)" }}
              />
              
              {cameraState === "off" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                  <CameraOff className="w-20 h-20 mb-4 text-gray-300" />
                  <p className="text-lg">الكاميرا متوقفة</p>
                  <p className="text-sm text-gray-400">اضغط على زر التشغيل لبدء البحث</p>
                </div>
              )}
              
              {cameraState === "loading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
                  <Loader2 className="w-16 h-16 text-[#1B7D3E] animate-spin mb-4" />
                  <p className="text-gray-600 text-lg">جاري تحميل الكاميرا...</p>
                </div>
              )}
              
              {cameraState === "on" && (
                <>
                  {detectedPersons.map(person => (
                    <div
                      key={person.id}
                      className="absolute pointer-events-none"
                      style={{
                        left: person.x,
                        top: person.y,
                        width: person.width,
                        height: person.height,
                      }}
                    >
                      <div className="absolute inset-0 border-4 border-[#1B7D3E] rounded-lg shadow-lg">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#C9A227] -translate-x-1 -translate-y-1" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#C9A227] translate-x-1 -translate-y-1" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#C9A227] -translate-x-1 translate-y-1" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#C9A227] translate-x-1 translate-y-1" />
                      </div>
                      
                      <div className="absolute -top-10 left-0 right-0 bg-[#1B7D3E] text-white text-center py-2 px-3 rounded-lg text-sm font-bold whitespace-nowrap shadow-lg">
                        {person.fullName}
                      </div>
                      
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow">
                        مفقود
                      </div>
                    </div>
                  ))}
                  
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 border-4 border-[#1B7D3E]/20 rounded-xl" />
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 px-4 py-2 rounded-full shadow-lg">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                      <span className="text-white text-sm font-bold">جاري البحث</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Camera Controls */}
            <div className="flex justify-center gap-4">
              {cameraState === "on" ? (
                <Button 
                  onClick={stopCamera}
                  variant="destructive"
                  size="lg"
                  className="px-8 py-6 text-lg"
                >
                  <CameraOff className="w-5 h-5 ml-2" />
                  إيقاف الكاميرا
                </Button>
              ) : (
                <Button 
                  onClick={startCamera}
                  className="bg-[#1B7D3E] hover:bg-[#156332] px-8 py-6 text-lg"
                  size="lg"
                  disabled={cameraState === "loading"}
                >
                  {cameraState === "loading" ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري التحميل...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 ml-2" />
                      تشغيل الكاميرا
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Detected Person Details */}
            {detectedPersons.length > 0 && (
              <Card className="bg-[#E8F5E9] border-[#1B7D3E] border-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-[#1B7D3E] flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-[#C9A227]" />
                    تم العثور على شخص مفقود!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {detectedPersons.map(person => (
                    <div key={person.id} className="flex gap-4 items-start">
                      {person.photoUrl && (
                        <img 
                          src={person.photoUrl} 
                          alt={person.fullName}
                          className="w-24 h-24 object-cover rounded-xl border-4 border-[#1B7D3E] shadow-lg"
                        />
                      )}
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                          <User className="w-5 h-5 text-[#1B7D3E]" />
                          {person.fullName}
                        </h3>
                        {person.age && (
                          <p className="text-gray-600">
                            العمر: {person.age} سنة - {person.gender === "male" ? "ذكر" : "أنثى"}
                          </p>
                        )}
                        {person.lastSeenLocation && (
                          <p className="text-gray-600 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#1B7D3E]" />
                            آخر مشاهدة: {person.lastSeenLocation}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Missing Persons List */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl text-gray-800">الأشخاص المفقودين المسجلين</CardTitle>
            <CardDescription className="text-gray-500">
              قائمة بجميع الأشخاص المفقودين الذين يتم البحث عنهم
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {missingPersons && missingPersons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {missingPersons.map(person => (
                  <Card key={person.id} className="bg-gray-50 border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {person.photoUrl ? (
                          <img 
                            src={person.photoUrl} 
                            alt={person.fullName}
                            className="w-16 h-16 object-cover rounded-lg border-2 border-[#1B7D3E]"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-gray-800 font-semibold truncate">{person.fullName}</h4>
                          {person.age && (
                            <p className="text-gray-500 text-sm">
                              {person.age} سنة - {person.gender === "male" ? "ذكر" : "أنثى"}
                            </p>
                          )}
                          {person.lastSeenLocation && (
                            <p className="text-gray-500 text-sm truncate flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {person.lastSeenLocation}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg text-gray-500">لا يوجد أشخاص مفقودين مسجلين حالياً</p>
                <Link href="/report">
                  <Button className="mt-4 bg-[#1B7D3E] hover:bg-[#156332]">
                    إضافة بلاغ جديد
                  </Button>
                </Link>
              </div>
            )}
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
