-- Keep product rating/review_count in sync with reviews
CREATE OR REPLACE FUNCTION public.recompute_product_rating(p_product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_avg numeric;
  v_count int;
BEGIN
  SELECT COALESCE(AVG(r.rating)::numeric, 0), COUNT(*)
  INTO v_avg, v_count
  FROM public.reviews r
  WHERE r.product_id = p_product_id;

  UPDATE public.products
  SET rating = v_avg,
      review_count = v_count,
      updated_at = now()
  WHERE id = p_product_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_recompute_product_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    PERFORM public.recompute_product_rating(OLD.product_id);
  ELSE
    PERFORM public.recompute_product_rating(NEW.product_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS reviews_recompute_product_rating_ins ON public.reviews;
DROP TRIGGER IF EXISTS reviews_recompute_product_rating_upd ON public.reviews;
DROP TRIGGER IF EXISTS reviews_recompute_product_rating_del ON public.reviews;

CREATE TRIGGER reviews_recompute_product_rating_ins
AFTER INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.trg_recompute_product_rating();

CREATE TRIGGER reviews_recompute_product_rating_upd
AFTER UPDATE OF rating, product_id ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.trg_recompute_product_rating();

CREATE TRIGGER reviews_recompute_product_rating_del
AFTER DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.trg_recompute_product_rating();


-- Fix/replace stock reduction: decrement stock when order items are created ("order placed")
DROP TRIGGER IF EXISTS reduce_stock_on_order_trigger ON public.orders;
DROP FUNCTION IF EXISTS public.reduce_stock_on_order();

CREATE OR REPLACE FUNCTION public.decrement_stock_on_order_item_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.product_id IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE public.products p
  SET stock_quantity = GREATEST(0, COALESCE(p.stock_quantity, 0) - NEW.quantity),
      in_stock = CASE
        WHEN (COALESCE(p.stock_quantity, 0) - NEW.quantity) <= 0 THEN false
        ELSE COALESCE(p.in_stock, true)
      END,
      updated_at = now()
  WHERE p.id = NEW.product_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS order_items_decrement_stock_ins ON public.order_items;
CREATE TRIGGER order_items_decrement_stock_ins
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.decrement_stock_on_order_item_insert();
