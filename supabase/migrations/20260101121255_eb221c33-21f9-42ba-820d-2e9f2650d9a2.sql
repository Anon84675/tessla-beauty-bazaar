-- Add 'driver' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'driver';

-- Create delivery_assignments table to track driver deliveries
CREATE TABLE public.delivery_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    picked_up_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'picked_up', 'in_transit', 'delivered')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(order_id)
);

-- Enable RLS
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;

-- Drivers can view their own assignments
CREATE POLICY "Drivers can view own assignments"
ON public.delivery_assignments
FOR SELECT
USING (driver_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Drivers can update their own assignments
CREATE POLICY "Drivers can update own assignments"
ON public.delivery_assignments
FOR UPDATE
USING (driver_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert assignments
CREATE POLICY "Admins can insert assignments"
ON public.delivery_assignments
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete assignments
CREATE POLICY "Admins can delete assignments"
ON public.delivery_assignments
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_delivery_assignments_updated_at
BEFORE UPDATE ON public.delivery_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Make products bucket public for image display
UPDATE storage.buckets SET public = true WHERE id = 'products';