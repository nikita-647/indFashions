// Local-only mock review service — no backend required.
// Reviews are seeded once and then persisted in localStorage so
// edits (status changes, replies, deletes) survive a page refresh.

const STORAGE_KEY = "mockReviews";

const seedReviews = () => [
  {
    _id: "1",
    userName: "Priya Sharma",
    userEmail: "priya@example.com",
    productName: "Cotton Kurti - Blue Floral",
    productImage: "https://via.placeholder.com/100",
    rating: 5,
    reviewText:
      "Absolutely love this kurti! The fabric is soft and comfortable. Perfect for daily wear. Highly recommend!",
    status: "approved",
    isVerifiedPurchase: true,
    createdAt: "2024-10-15T10:30:00Z",
    adminReply: "Thank you for your wonderful feedback!",
    repliedAt: "2024-10-16T09:00:00Z",
  },
  {
    _id: "2",
    userName: "Rahul Kumar",
    userEmail: "rahul@example.com",
    productName: "Silk Saree - Traditional Red",
    productImage: "https://via.placeholder.com/100",
    rating: 4,
    reviewText:
      "Beautiful saree with elegant design. Quality is good but delivery was slightly delayed.",
    status: "pending",
    isVerifiedPurchase: true,
    createdAt: "2024-10-20T14:20:00Z",
  },
  {
    _id: "3",
    userName: "Ananya Gupta",
    userEmail: "ananya@example.com",
    productName: "Designer Lehenga - Pink",
    productImage: "https://via.placeholder.com/100",
    rating: 5,
    reviewText:
      "Stunning lehenga! Got so many compliments at the wedding. Worth every penny!",
    status: "approved",
    isVerifiedPurchase: true,
    createdAt: "2024-10-18T16:45:00Z",
  },
  {
    _id: "4",
    userName: "Vikram Singh",
    userEmail: "vikram@example.com",
    productName: "Formal Kurta Set - White",
    productImage: "https://via.placeholder.com/100",
    rating: 3,
    reviewText:
      "Product is okay but not as shown in pictures. The color is slightly different.",
    status: "pending",
    isVerifiedPurchase: false,
    createdAt: "2024-10-22T11:15:00Z",
  },
  {
    _id: "5",
    userName: "Neha Patel",
    userEmail: "neha@example.com",
    productName: "Embroidered Dupatta - Golden",
    productImage: "https://via.placeholder.com/100",
    rating: 2,
    reviewText:
      "Very disappointed with the quality. The embroidery work is not up to the mark.",
    status: "rejected",
    isVerifiedPurchase: true,
    createdAt: "2024-10-19T13:30:00Z",
  },
  {
    _id: "6",
    userName: "Kavya Reddy",
    userEmail: "kavya@example.com",
    productName: "Palazzo Set - Navy Blue",
    productImage: "https://via.placeholder.com/100",
    rating: 5,
    reviewText:
      "Perfect fit and excellent quality! The color is exactly as shown. Very satisfied with my purchase.",
    status: "approved",
    isVerifiedPurchase: true,
    createdAt: "2024-10-21T09:00:00Z",
  },
];

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fall through to reseed
  }
  const seeded = seedReviews();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
};

const save = (reviews) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
};

// tiny helper to keep the UI's loading states feeling real
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const applyFilters = (reviews, filters = {}) => {
  let result = [...reviews];

  if (filters.status) {
    result = result.filter((r) => r.status === filters.status);
  }
  if (filters.rating) {
    result = result.filter((r) => String(r.rating) === String(filters.rating));
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (r) =>
        r.userName?.toLowerCase().includes(q) ||
        r.productName?.toLowerCase().includes(q) ||
        r.reviewText?.toLowerCase().includes(q)
    );
  }
  if (filters.startDate) {
    result = result.filter(
      (r) => new Date(r.createdAt) >= new Date(filters.startDate)
    );
  }
  if (filters.endDate) {
    result = result.filter(
      (r) => new Date(r.createdAt) <= new Date(filters.endDate)
    );
  }

  return result;
};

const reviewService = {
  getAllReviews: async (filters = {}) => {
    await delay();
    const reviews = applyFilters(load(), filters);
    return { success: true, data: { reviews } };
  },

  getReviewById: async (reviewId) => {
    await delay();
    const review = load().find((r) => r._id === reviewId);
    return { success: !!review, data: review || null };
  },

  updateReviewStatus: async (reviewId, status) => {
    await delay();
    const reviews = load().map((r) =>
      r._id === reviewId ? { ...r, status } : r
    );
    save(reviews);
    return { success: true, data: reviews.find((r) => r._id === reviewId) };
  },

  deleteReview: async (reviewId) => {
    await delay();
    const reviews = load().filter((r) => r._id !== reviewId);
    save(reviews);
    return { success: true };
  },

  replyToReview: async (reviewId, replyText) => {
    await delay();
    const reviews = load().map((r) =>
      r._id === reviewId
        ? { ...r, adminReply: replyText, repliedAt: new Date().toISOString() }
        : r
    );
    save(reviews);
    return { success: true, data: reviews.find((r) => r._id === reviewId) };
  },

  getReviewStats: async () => {
    await delay();
    const reviews = load();
    const total = reviews.length;
    const approved = reviews.filter((r) => r.status === "approved").length;
    const pending = reviews.filter((r) => r.status === "pending").length;
    const rejected = reviews.filter((r) => r.status === "rejected").length;
    const averageRating =
      total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;

    return {
      success: true,
      data: { total, approved, pending, rejected, averageRating },
    };
  },

  toggleFeaturedReview: async (reviewId, featured) => {
    await delay();
    const reviews = load().map((r) =>
      r._id === reviewId ? { ...r, featured } : r
    );
    save(reviews);
    return { success: true, data: reviews.find((r) => r._id === reviewId) };
  },

  reportReview: async (reviewId, reason) => {
    await delay();
    const reviews = load().map((r) =>
      r._id === reviewId ? { ...r, reported: true, reportReason: reason } : r
    );
    save(reviews);
    return { success: true };
  },
};

export default reviewService;
