import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useState, useRef, useCallback } from "react";
import { Camera, Upload, X, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function ReportForm() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "" as "male" | "female" | "",
    nationalId: "",
    phoneNumber: "",
    description: "",
    lastSeenLocation: "",
    lastSeenDate: "",
  });
  
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const createMutation = trpc.missingPerson.create.useMutation({
    onSuccess: () => {
      setIsSuccess(true);
      toast.success("تم إرسال البلاغ بنجاح");
      setTimeout(() => {
        navigate("/detection");
      }, 2000);
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء إرسال البلاغ");
      console.error(error);
    },
  });

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOpen(true);
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
    setIsCameraOpen(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setPhotoBase64(dataUrl);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.gender) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createMutation.mutateAsync({
        fullName: formData.fullName,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender as "male" | "female",
        nationalId: formData.nationalId || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        description: formData.description || undefined,
        lastSeenLocation: formData.lastSeenLocation || undefined,
        lastSeenDate: formData.lastSeenDate || undefined,
        photoBase64: photoBase64 || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4" dir="rtl">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">تسجيل الدخول مطلوب</CardTitle>
            <CardDescription className="text-slate-400">
              يجب تسجيل الدخول لإرسال بلاغ عن شخص مفقود
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => window.location.href = getLoginUrl()}
            >
              تسجيل الدخول
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4" dir="rtl">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">تم إرسال البلاغ بنجاح</h2>
            <p className="text-slate-400">جاري تحويلك إلى صفحة البحث...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white text-center">إبلاغ عن شخص مفقود</CardTitle>
            <CardDescription className="text-slate-400 text-center">
              أدخل معلومات الشخص المفقود وصورته
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Section */}
              <div className="space-y-4">
                <Label className="text-white text-lg">صورة الشخص المفقود</Label>
                
                {photoBase64 ? (
                  <div className="relative w-48 h-48 mx-auto">
                    <img 
                      src={photoBase64} 
                      alt="صورة الشخص" 
                      className="w-full h-full object-cover rounded-lg border-2 border-emerald-500"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2"
                      onClick={() => setPhotoBase64(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : isCameraOpen ? (
                  <div className="space-y-4">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-w-md mx-auto rounded-lg border-2 border-slate-600"
                    />
                    <div className="flex gap-2 justify-center">
                      <Button type="button" onClick={capturePhoto} className="bg-emerald-600 hover:bg-emerald-700">
                        <Camera className="w-4 h-4 ml-2" />
                        التقاط الصورة
                      </Button>
                      <Button type="button" variant="outline" onClick={stopCamera}>
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4 justify-center">
                    <Button type="button" onClick={startCamera} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      <Camera className="w-4 h-4 ml-2" />
                      فتح الكاميرا
                    </Button>
                    <Label className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border border-slate-600 rounded-md text-slate-300 hover:bg-slate-700 transition-colors">
                        <Upload className="w-4 h-4" />
                        رفع صورة
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </Label>
                  </div>
                )}
              </div>

              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white">الاسم الكامل *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    placeholder="أدخل الاسم الكامل"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="text-white">العمر</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    placeholder="أدخل العمر"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-white">الجنس *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value as "male" | "female" }))}
                  >
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="اختر الجنس" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ذكر</SelectItem>
                      <SelectItem value="female">أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationalId" className="text-white">رقم الهوية</Label>
                  <Input
                    id="nationalId"
                    value={formData.nationalId}
                    onChange={(e) => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    placeholder="أدخل رقم الهوية"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-white">رقم الهاتف</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="bg-slate-700/50 border-slate-600 text-white"
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastSeenDate" className="text-white">تاريخ آخر مشاهدة</Label>
                  <Input
                    id="lastSeenDate"
                    type="date"
                    value={formData.lastSeenDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastSeenDate: e.target.value }))}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastSeenLocation" className="text-white">مكان آخر مشاهدة</Label>
                <Input
                  id="lastSeenLocation"
                  value={formData.lastSeenLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastSeenLocation: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600 text-white"
                  placeholder="أدخل مكان آخر مشاهدة"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">وصف إضافي</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600 text-white min-h-[100px]"
                  placeholder="أدخل أي معلومات إضافية عن الشخص المفقود (الملابس، علامات مميزة، إلخ)"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  "إرسال البلاغ"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
