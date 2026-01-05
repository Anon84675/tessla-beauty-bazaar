import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

const ImageUpload = ({ images, onImagesChange, maxImages = 5 }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `product-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error details:", uploadError);
          // Provide more specific error messages
          if (uploadError.message?.includes("duplicate")) {
            toast.error(`File already exists. Try renaming ${file.name}`);
          } else if (uploadError.message?.includes("permission") || uploadError.message?.includes("policy")) {
            toast.error("Upload permission denied. Please sign in as admin.");
          } else if (uploadError.message?.includes("size")) {
            toast.error(`File ${file.name} exceeds size limit`);
          } else {
            toast.error(`Failed to upload ${file.name}: ${uploadError.message || "Unknown error"}`);
          }
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("products")
          .getPublicUrl(filePath);

        uploadedUrls.push(urlData.publicUrl);
      }

      if (uploadedUrls.length > 0) {
        onImagesChange([...images, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} image(s) uploaded`);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error?.message || "Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || images.length >= maxImages}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Images
            </>
          )}
        </Button>
        <span className="text-sm text-muted-foreground">
          {images.length}/{maxImages} images
        </span>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
              <img
                src={url}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-lg bg-secondary/30">
          <div className="text-center text-muted-foreground">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No images uploaded</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
