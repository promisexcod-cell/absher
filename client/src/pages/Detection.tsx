import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, CameraOff, AlertTriangle, User, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

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
        
        // Use event listener instead of property assignment
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
          
          // Remove listener after first trigger
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
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Clear detection interval
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    setCameraState("off");
    setDetectedPersons([]);
  }, []);

  // Cleanup on unmount
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

  // Simulate face detection
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

  // Start detection when camera is on
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white text-center flex items-center justify-center gap-2">
              <Camera className="w-6 h-6 text-emerald-500" />
              نظام البحث عن المفقودين
            </CardTitle>
            <CardDescription className="text-slate-400 text-center">
              افتح الكاميرا للبحث عن الأشخاص المفقودين المسجلين في النظام
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Camera View */}
            <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700">
              {/* Video element - always rendered but hidden when off */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraState === "on" ? "block" : "hidden"}`}
                style={{ transform: "scaleX(-1)" }}
              />
              
              {/* Camera off state */}
              {cameraState === "off" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                  <CameraOff className="w-16 h-16 mb-4" />
                  <p>الكاميرا متوقفة</p>
                </div>
              )}
              
              {/* Loading state */}
              {cameraState === "loading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                  <p className="text-white">جاري تحميل الكاميرا...</p>
                </div>
              )}
              
              {/* Detection overlay - only when camera is on */}
              {cameraState === "on" && (
                <>
                  {/* Detection boxes */}
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
                      <div className="absolute inset-0 border-4 border-emerald-500 rounded">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 -translate-x-1 -translate-y-1" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 translate-x-1 -translate-y-1" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 -translate-x-1 translate-y-1" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 translate-x-1 translate-y-1" />
                      </div>
                      
                      <div className="absolute -top-9 left-0 right-0 bg-emerald-600 text-white text-center py-1.5 px-3 rounded text-sm font-bold whitespace-nowrap">
                        {person.fullName}
                      </div>
                      
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
                        مفقود
                      </div>
                    </div>
                  ))}
                  
                  {/* Scanning indicator */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 border-2 border-emerald-500/30 animate-pulse" />
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/90 px-3 py-1.5 rounded-full shadow-lg">
                      <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                      <span className="text-white text-sm font-medium">جاري البحث</span>
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
                  className="px-8"
                >
                  <CameraOff className="w-5 h-5 ml-2" />
                  إيقاف الكاميرا
                </Button>
              ) : (
                <Button 
                  onClick={startCamera}
                  className="bg-emerald-600 hover:bg-emerald-700 px-8"
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
              <Card className="bg-emerald-900/30 border-emerald-700">
                <CardHeader>
                  <CardTitle className="text-lg text-emerald-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
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
                          className="w-24 h-24 object-cover rounded-lg border-2 border-emerald-500"
                        />
                      )}
                      <div className="space-y-2 text-white">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <User className="w-5 h-5 text-emerald-400" />
                          {person.fullName}
                        </h3>
                        {person.age && (
                          <p className="text-slate-300">
                            العمر: {person.age} سنة - {person.gender === "male" ? "ذكر" : "أنثى"}
                          </p>
                        )}
                        {person.lastSeenLocation && (
                          <p className="text-slate-300 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-400" />
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
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl text-white">الأشخاص المفقودين المسجلين</CardTitle>
            <CardDescription className="text-slate-400">
              قائمة بجميع الأشخاص المفقودين الذين يتم البحث عنهم
            </CardDescription>
          </CardHeader>
          <CardContent>
            {missingPersons && missingPersons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {missingPersons.map(person => (
                  <Card key={person.id} className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {person.photoUrl ? (
                          <img 
                            src={person.photoUrl} 
                            alt={person.fullName}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-slate-600 rounded-lg flex items-center justify-center">
                            <User className="w-8 h-8 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">{person.fullName}</h4>
                          {person.age && (
                            <p className="text-slate-400 text-sm">
                              {person.age} سنة - {person.gender === "male" ? "ذكر" : "أنثى"}
                            </p>
                          )}
                          {person.lastSeenLocation && (
                            <p className="text-slate-400 text-sm truncate flex items-center gap-1">
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
              <div className="text-center py-8 text-slate-400">
                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>لا يوجد أشخاص مفقودين مسجلين حالياً</p>
                <Link href="/report">
                  <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                    إضافة بلاغ جديد
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
