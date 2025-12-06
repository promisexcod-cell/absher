import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, CameraOff, AlertTriangle, User, MapPin, Calendar } from "lucide-react";
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
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [detectedPersons, setDetectedPersons] = useState<DetectedPerson[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data: missingPersons } = trpc.missingPerson.list.useQuery();

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
        setIsDetecting(true);
        toast.success("تم تشغيل الكاميرا - جاري البحث عن المفقودين");
      }
    } catch (error) {
      toast.error("لا يمكن الوصول إلى الكاميرا");
      console.error(error);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setIsCameraOpen(false);
    setIsDetecting(false);
    setDetectedPersons([]);
  }, []);

  // Simulate face detection - in a real app, this would use a face detection API
  const simulateDetection = useCallback(() => {
    if (!missingPersons || missingPersons.length === 0) return;
    
    // Randomly decide if we "detect" someone (for simulation purposes)
    const shouldDetect = Math.random() > 0.7; // 30% chance of detection
    
    if (shouldDetect) {
      const randomPerson = missingPersons[Math.floor(Math.random() * missingPersons.length)];
      
      // Generate random position for the bounding box
      const videoWidth = videoRef.current?.videoWidth || 640;
      const videoHeight = videoRef.current?.videoHeight || 480;
      
      const boxWidth = 150 + Math.random() * 100;
      const boxHeight = boxWidth * 1.3;
      const x = Math.random() * (videoWidth - boxWidth);
      const y = Math.random() * (videoHeight - boxHeight);
      
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
      
      // Show alert
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
  }, [missingPersons]);

  // Draw detection overlay
  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video || !isCameraOpen) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Match canvas size to video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw detection boxes
    detectedPersons.forEach(person => {
      // Draw bounding box
      ctx.strokeStyle = "#10b981"; // emerald-500
      ctx.lineWidth = 3;
      ctx.strokeRect(person.x, person.y, person.width, person.height);
      
      // Draw corner accents
      const cornerLength = 20;
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 4;
      
      // Top-left
      ctx.beginPath();
      ctx.moveTo(person.x, person.y + cornerLength);
      ctx.lineTo(person.x, person.y);
      ctx.lineTo(person.x + cornerLength, person.y);
      ctx.stroke();
      
      // Top-right
      ctx.beginPath();
      ctx.moveTo(person.x + person.width - cornerLength, person.y);
      ctx.lineTo(person.x + person.width, person.y);
      ctx.lineTo(person.x + person.width, person.y + cornerLength);
      ctx.stroke();
      
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(person.x, person.y + person.height - cornerLength);
      ctx.lineTo(person.x, person.y + person.height);
      ctx.lineTo(person.x + cornerLength, person.y + person.height);
      ctx.stroke();
      
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(person.x + person.width - cornerLength, person.y + person.height);
      ctx.lineTo(person.x + person.width, person.y + person.height);
      ctx.lineTo(person.x + person.width, person.y + person.height - cornerLength);
      ctx.stroke();
      
      // Draw name label
      const labelHeight = 30;
      const labelY = person.y - labelHeight - 5;
      
      ctx.fillStyle = "rgba(16, 185, 129, 0.9)"; // emerald with opacity
      ctx.fillRect(person.x, labelY, person.width, labelHeight);
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(person.fullName, person.x + person.width / 2, labelY + labelHeight / 2);
      
      // Draw "FOUND" badge
      ctx.fillStyle = "#ef4444"; // red
      ctx.fillRect(person.x + person.width - 60, person.y + 5, 55, 20);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px Arial";
      ctx.fillText("مفقود", person.x + person.width - 32, person.y + 15);
    });
    
    animationRef.current = requestAnimationFrame(drawOverlay);
  }, [detectedPersons, isCameraOpen]);

  // Start detection simulation when camera is open
  useEffect(() => {
    if (isCameraOpen && isDetecting) {
      // Run detection every 3 seconds
      detectionIntervalRef.current = setInterval(simulateDetection, 3000);
      animationRef.current = requestAnimationFrame(drawOverlay);
    }
    
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isCameraOpen, isDetecting, simulateDetection, drawOverlay]);

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
              {isCameraOpen ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  />
                  {/* Scanning overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 border-2 border-emerald-500/30 animate-pulse" />
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/80 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-white text-sm font-medium">جاري البحث</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                  <CameraOff className="w-16 h-16 mb-4" />
                  <p>الكاميرا متوقفة</p>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            <div className="flex justify-center gap-4">
              {isCameraOpen ? (
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
                >
                  <Camera className="w-5 h-5 ml-2" />
                  تشغيل الكاميرا
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
