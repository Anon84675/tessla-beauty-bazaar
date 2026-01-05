-- Create a function to reduce stock when order is placed
CREATE OR REPLACE FUNCTION public.reduce_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Only reduce stock when order status changes to 'paid'
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status = 'pending') THEN
    -- Reduce stock for all items in this order
    UPDATE public.products p
    SET stock_quantity = GREATEST(0, p.stock_quantity - oi.quantity),
        in_stock = CASE 
          WHEN (p.stock_quantity - oi.quantity) <= 0 THEN false 
          ELSE p.in_stock 
        END
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id
      AND oi.product_id = p.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to reduce stock when order is paid
DROP TRIGGER IF EXISTS reduce_stock_on_order_trigger ON public.orders;
CREATE TRIGGER reduce_stock_on_order_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.reduce_stock_on_order();