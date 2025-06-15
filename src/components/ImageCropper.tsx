
import React, { useState, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  image: File;
  onCrop: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ image, onCrop, onCancel }) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [imgRef, setImgRef] = useState<HTMLImageElement>();
  const [imageUrl, setImageUrl] = useState<string>('');

  React.useEffect(() => {
    const url = URL.createObjectURL(image);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setImgRef(e.currentTarget);
  }, []);

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: PixelCrop): Promise<string> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            throw new Error('Canvas is empty');
          }
          const url = URL.createObjectURL(blob);
          resolve(url);
        }, 'image/jpeg', 0.9);
      });
    },
    []
  );

  const handleCrop = useCallback(async () => {
    if (imgRef && completedCrop?.width && completedCrop?.height) {
      try {
        const croppedImageUrl = await getCroppedImg(imgRef, completedCrop);
        onCrop(croppedImageUrl);
      } catch (error) {
        console.error('Error cropping image:', error);
      }
    }
  }, [completedCrop, imgRef, getCroppedImg, onCrop]);

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-center p-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={undefined}
            className="max-w-full"
          >
            <img
              src={imageUrl}
              onLoad={onImageLoad}
              alt="Crop preview"
              className="max-w-full max-h-96 object-contain"
            />
          </ReactCrop>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleCrop} disabled={!completedCrop?.width || !completedCrop?.height}>
            Crop & Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;
