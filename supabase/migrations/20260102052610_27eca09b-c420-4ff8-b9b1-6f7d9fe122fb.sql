-- Allow drivers to view orders with status 'paid' (for available jobs)
CREATE POLICY "Drivers can view paid orders"
ON public.orders
FOR SELECT
USING (
  status = 'paid' AND has_role(auth.uid(), 'driver'::app_role)
);

-- Allow drivers to view orders they have been assigned to (for active deliveries)
CREATE POLICY "Drivers can view assigned orders"
ON public.orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.delivery_assignments
    WHERE delivery_assignments.order_id = orders.id
    AND delivery_assignments.driver_id = auth.uid()
  )
);

-- Allow drivers to insert delivery assignments (to accept jobs)
CREATE POLICY "Drivers can accept jobs"
ON public.delivery_assignments
FOR INSERT
WITH CHECK (
  driver_id = auth.uid() AND has_role(auth.uid(), 'driver'::app_role)
);

-- Allow drivers to update order status when delivering
CREATE POLICY "Drivers can update assigned order status"
ON public.orders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.delivery_assignments
    WHERE delivery_assignments.order_id = orders.id
    AND delivery_assignments.driver_id = auth.uid()
  )
);