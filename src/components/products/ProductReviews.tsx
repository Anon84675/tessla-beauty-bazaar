import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star, User, CheckCircle, Loader2, Pencil, X, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  user_id: string;
}

interface ProductReviewsProps {
  productId: string;
  onReviewAdded?: () => void;
}

const ProductReviews = ({ productId, onReviewAdded }: ProductReviewsProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: "",
  });

  useEffect(() => {
    fetchReviews();
    if (user) {
      checkUserPurchase();
    }
  }, [productId, user]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, rating, title, comment, is_verified_purchase, created_at, user_id")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
      
      if (user) {
        const found = data?.find((r) => r.user_id === user.id);
        setUserReview(found || null);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserPurchase = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("order_items")
        .select(`id, order:orders!inner(user_id, status)`)
        .eq("product_id", productId);

      if (error) throw error;
      
      const hasBought = data?.some(
        (item: any) => item.order?.user_id === user.id && 
        ["paid", "dispatched", "delivered"].includes(item.order?.status)
      );
      setHasPurchased(hasBought || false);
    } catch (error) {
      console.error("Error checking purchase:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to leave a review");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingReview) {
        // Update existing review
        const { error } = await supabase
          .from("reviews")
          .update({
            rating: formData.rating,
            title: formData.title || null,
            comment: formData.comment || null,
          })
          .eq("id", editingReview.id)
          .eq("user_id", user.id);

        if (error) throw error;
        toast.success("Review updated!");
        setEditingReview(null);
      } else {
        // Create new review
        const { error } = await supabase.from("reviews").insert({
          product_id: productId,
          user_id: user.id,
          rating: formData.rating,
          title: formData.title || null,
          comment: formData.comment || null,
          is_verified_purchase: hasPurchased,
        });

        if (error) throw error;
        toast.success("Review submitted!");
      }

      setShowForm(false);
      setFormData({ rating: 5, title: "", comment: "" });
      fetchReviews();
      onReviewAdded?.();
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("You have already reviewed this product");
      } else {
        toast.error("Failed to save review");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditReview = (review: Review) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating,
      title: review.title || "",
      comment: review.comment || "",
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingReview(null);
    setShowForm(false);
    setFormData({ rating: 5, title: "", comment: "" });
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (isLoading) {
    return (
      <div className="py-6 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="border-t border-border pt-6 mt-8">
        {/* Compact Header - Always Visible */}
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between py-2 hover:bg-muted/30 rounded-lg px-2 transition-colors">
            <div className="flex items-center gap-4">
              <h3 className="font-medium text-base">Customer Reviews</h3>
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.round(averageRating)
                          ? "text-accent fill-accent"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {averageRating.toFixed(1)} ({reviews.length})
                </span>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-4 space-y-4">
          {/* Write/Edit Review Button */}
          {user && !showForm && (
            <div className="flex gap-2">
              {userReview ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEditReview(userReview)}
                  className="text-sm"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit Your Review
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForm(true)}
                  className="text-sm"
                >
                  Write a Review
                </Button>
              )}
            </div>
          )}

          {/* Compact Review Form */}
          {showForm && (
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {editingReview ? "Edit Review" : "Your Review"}
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rating:</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-0.5"
                      >
                        <Star
                          className={`h-5 w-5 transition-colors ${
                            star <= formData.rating
                              ? "text-accent fill-accent"
                              : "text-muted-foreground/30 hover:text-accent/80"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Review title (optional)"
                  maxLength={100}
                  className="h-9 text-sm"
                />

                <Textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Share your experience..."
                  rows={3}
                  maxLength={1000}
                  className="text-sm resize-none"
                />

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : editingReview ? "Update" : "Submit"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews List - Compact */}
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No reviews yet. Be the first to share your experience!
            </p>
          ) : (
            <div className="space-y-3">
              {reviews.slice(0, isExpanded ? undefined : 3).map((review) => (
                <div key={review.id} className="flex gap-3 py-2">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating
                                ? "text-accent fill-accent"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      {review.is_verified_purchase && (
                        <span className="flex items-center gap-0.5 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(review.created_at), "MMM d, yyyy")}
                      </span>
                      {user && review.user_id === user.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 px-1.5 text-xs text-muted-foreground"
                          onClick={() => startEditReview(review)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    {review.title && (
                      <p className="text-sm font-medium mt-0.5">{review.title}</p>
                    )}
                    {review.comment && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default ProductReviews;