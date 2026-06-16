import type { Review } from "@/types";

export const MOCK_REVIEWS: Review[] = [
  { id: "r1", productId: "1", userName: "Priya Sharma", rating: 5, comment: "This neem pack has completely transformed my skin! Used it for 3 weeks and my acne has reduced by 80%. The texture is smooth and it doesn't feel harsh at all. Definitely repurchasing!", date: "2025-04-15", verified: true },
  { id: "r2", productId: "1", userName: "Ananya M.", rating: 5, comment: "Finally found a natural product that actually works for my oily skin. The pack controls oil for the whole day after use. Smells earthy and fresh — very premium.", date: "2025-04-02", verified: true },
  { id: "r3", productId: "1", userName: "Kavitha R.", rating: 4, comment: "Really good product. My blackheads have visibly reduced. The packaging is absolutely luxurious — feels like a spa gift.", date: "2025-03-18", verified: true },

  { id: "r4", productId: "2", userName: "Deepika Nair", rating: 5, comment: "My skin literally glows after using this. The saffron is real — you can see the golden strands. My friends keep asking what I'm using!", date: "2025-05-01", verified: true },
  { id: "r5", productId: "2", userName: "Ritu Agarwal", rating: 5, comment: "I've tried so many brightening products but nothing compares to this Haldi pack. My dark spots have faded noticeably in just 2 weeks. Worth every rupee!", date: "2025-04-22", verified: true },
  { id: "r6", productId: "2", userName: "Sunita P.", rating: 5, comment: "Amazing product. My skin tone has evened out and I get compliments constantly. The golden glow is real and long-lasting. This is now a permanent part of my skincare.", date: "2025-04-08", verified: true },

  { id: "r7", productId: "3", userName: "Meera Krishnan", rating: 5, comment: "This is THE most luxurious face pack I've ever used. The rose scent is divine and my skin feels plump and dewy after every use. Completely obsessed!", date: "2025-05-10", verified: true },
  { id: "r8", productId: "3", userName: "Pooja Verma", rating: 4, comment: "Lovely product for dry skin! My skin feels so soft and hydrated. The petal pieces in the pack feel so indulgent. Will definitely buy again.", date: "2025-04-28", verified: true },

  { id: "r9", productId: "4", userName: "Aditi Chakraborty", rating: 4, comment: "Very gentle exfoliant — doesn't irritate my sensitive skin at all. Skin feels incredibly smooth and bright afterwards. The packaging is beautiful too.", date: "2025-05-05", verified: true },
  { id: "r10", productId: "4", userName: "Nandita Roy", rating: 5, comment: "Been using this for a month and the texture of my skin has improved dramatically. Pores look smaller and skin is so soft. Highly recommend!", date: "2025-04-15", verified: true },

  { id: "r11", productId: "5", userName: "Shalini Gupta", rating: 5, comment: "The best multani mitti pack I've ever tried. Far superior to the plain clay from the market. My skin feels clean, cool and fresh. No dryness at all!", date: "2025-04-30", verified: true },
  { id: "r12", productId: "5", userName: "Tanvi Joshi", rating: 4, comment: "Really effective for oily skin control. After use, my skin stays matte for 6–8 hours. The charcoal addition makes this pack very powerful yet gentle.", date: "2025-04-10", verified: true },

  { id: "r13", productId: "6", userName: "Anjali Mehta", rating: 5, comment: "Used this for my wedding 21-day ritual and I literally cried at how beautiful my skin looked on the day. The saffron and rose scent is heavenly. Worth every single rupee!", date: "2025-03-28", verified: true },
  { id: "r14", productId: "6", userName: "Smita Patel", rating: 5, comment: "This ubtan is absolutely royal! I used it for my sister's wedding and she got so many compliments about her glowing skin. We will order every time someone in our family has a special occasion.", date: "2025-05-02", verified: true },
  { id: "r15", productId: "6", userName: "Isha Kapoor", rating: 5, comment: "Beyond expectations! My skin was dull and tanned before starting the ritual. After 21 days with the Bridal Ubtan, I looked 5 years younger. Magical product!", date: "2025-04-18", verified: true },
];

export const getProductReviews = (productId: string): Review[] =>
  MOCK_REVIEWS.filter((r) => r.productId === productId);
