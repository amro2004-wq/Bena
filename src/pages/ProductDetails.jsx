import "./ProductDetails.css";

import { defaultProducts } from "../data/products";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowRight,
  Heart,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Clock,
  Share2,
  UserRound,
  Pencil,
  ShoppingCart,
  Check,
  ImageOff,
  Phone,
  Clock3,
  PackageCheck,
  LockKeyhole,
  BadgeCheck,
} from "lucide-react";

import Toast from "../components/Toast";
import Navbar from "../components/Navbar";

import { addToCart, animateProductToCart, getCart } from "../utils/cart";

/* =========================================
   ORDER HELPERS
========================================= */

const normalizeOrderStatus = (status) =>
  String(status || "")
    .trim()
    .toLowerCase();

/*
  كل الحالات التي تجعل المنتج غير متاح
  لمشتري جديد.
*/

const ACTIVE_ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "completed",
];

/*
  نعطي أولوية للحالة الأقوى في حال وُجد
  أكثر من طلب قديم لنفس المنتج.
*/

const ORDER_STATUS_PRIORITY = {
  completed: 4,
  preparing: 3,
  confirmed: 2,
  pending: 1,
};

/* BUYER ID */

const getOrderBuyerId = (order) => {
  const buyerId =
    order?.buyerId ??
    order?.userId ??
    order?.buyer?.id ??
    order?.user?.id ??
    null;

  if (buyerId === undefined || buyerId === null || buyerId === "") {
    return null;
  }

  return String(buyerId);
};

/* PRODUCT IDS INSIDE ORDER */

const getOrderProductIds = (order) => {
  const ids = [];

  const addId = (value) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    ids.push(String(value));
  };

  /* PRODUCTS */

  if (Array.isArray(order?.products)) {
    order.products.forEach((item) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        addId(
          item.productId ??
            item.id ??
            item.product?.id ??
            item.product?.productId,
        );
      } else {
        addId(item);
      }
    });
  }

  /* ITEMS */

  if (Array.isArray(order?.items)) {
    order.items.forEach((item) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        addId(
          item.productId ??
            item.id ??
            item.product?.id ??
            item.product?.productId,
        );
      } else {
        addId(item);
      }
    });
  }

  /* SINGLE PRODUCT */

  addId(order?.productId);

  return [...new Set(ids)];
};

/* ORDER CONTAINS PRODUCT */

const orderContainsProduct = (order, productId) => {
  const targetId = String(productId);

  return getOrderProductIds(order).some(
    (itemId) => String(itemId) === targetId,
  );
};

/* ORDER TIME */

const getOrderTime = (order) => {
  const possibleDates = [
    order?.updatedAt,
    order?.createdAt,
    order?.date,
    order?.orderDate,
  ];

  for (const value of possibleDates) {
    const time = new Date(value || "").getTime();

    if (Number.isFinite(time)) {
      return time;
    }
  }

  const numericId = Number(order?.id);

  return Number.isFinite(numericId) ? numericId : 0;
};

/* GET ACTIVE ORDER FOR PRODUCT */

const getRelevantProductOrder = (orders, productId) => {
  if (!Array.isArray(orders)) {
    return null;
  }

  const relevantOrders = orders
    .filter((order) => {
      const status = normalizeOrderStatus(order?.status);

      return (
        ACTIVE_ORDER_STATUSES.includes(status) &&
        orderContainsProduct(order, productId)
      );
    })
    .sort((a, b) => {
      const statusA = normalizeOrderStatus(a?.status);
      const statusB = normalizeOrderStatus(b?.status);

      const priorityDifference =
        (ORDER_STATUS_PRIORITY[statusB] || 0) -
        (ORDER_STATUS_PRIORITY[statusA] || 0);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return getOrderTime(b) - getOrderTime(a);
    });

  return relevantOrders[0] || null;
};

/* =========================================
   PRODUCT DETAILS
========================================= */

function ProductDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const toastTimerRef = useRef(null);

  const loginTimerRef = useRef(null);

  /* =========================================
     STORAGE
  ========================================= */

  const readStorage = useCallback((key, fallback) => {
    try {
      const value = localStorage.getItem(key);

      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }, []);

  /* =========================================
     USER
  ========================================= */

  const getCurrentUser = useCallback(() => {
    const savedUser = readStorage("benaCurrentUser", null);

    if (
      !savedUser ||
      typeof savedUser !== "object" ||
      Array.isArray(savedUser)
    ) {
      return null;
    }

    return savedUser;
  }, [readStorage]);

  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  const userId =
    currentUser?.id !== undefined && currentUser?.id !== null
      ? String(currentUser.id)
      : null;

  /* =========================================
     PRODUCTS
  ========================================= */

  const getSavedProducts = useCallback(() => {
    const saved = readStorage("benaProducts", []);

    return Array.isArray(saved) ? saved : [];
  }, [readStorage]);

  const [savedProducts, setSavedProducts] = useState(() => getSavedProducts());

  /*
    نستخدم Map حتى إذا كان المنتج موجودًا
    في defaultProducts و benaProducts
    لا يظهر لدينا نسختان.
  */

  const products = useMemo(() => {
    const map = new Map();

    if (Array.isArray(defaultProducts)) {
      defaultProducts.forEach((item) => {
        if (item?.id !== undefined && item?.id !== null) {
          map.set(String(item.id), item);
        }
      });
    }

    savedProducts.forEach((item) => {
      if (item?.id !== undefined && item?.id !== null) {
        map.set(String(item.id), item);
      }
    });

    return Array.from(map.values());
  }, [savedProducts]);

  const product = useMemo(() => {
    return products.find((item) => String(item?.id) === String(id));
  }, [products, id]);

  /* =========================================
     USERS
  ========================================= */

  const getUsers = useCallback(() => {
    const savedUsers = readStorage("benaUsers", []);

    return Array.isArray(savedUsers) ? savedUsers : [];
  }, [readStorage]);

  const [users, setUsers] = useState(() => getUsers());

  /* =========================================
     SELLER
  ========================================= */

  const seller = useMemo(() => {
    if (product?.sellerId === undefined || product?.sellerId === null) {
      return null;
    }

    return users.find((user) => String(user?.id) === String(product.sellerId));
  }, [users, product]);

  const sellerName = seller?.name || product?.sellerName || "بائع على بينا";

  /* =========================================
     SELLER PROFILE
  ========================================= */

  const sellerProfile = useMemo(() => {
    if (product?.sellerId === undefined || product?.sellerId === null) {
      return null;
    }

    const profiles = readStorage("benaProfiles", {});

    if (!profiles || typeof profiles !== "object" || Array.isArray(profiles)) {
      return null;
    }

    const profile = profiles[String(product.sellerId)];

    if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
      return null;
    }

    return profile;
  }, [product, readStorage]);

  const sellerPhone = sellerProfile?.phone || seller?.phone || "";

  /* =========================================
     OWNER
  ========================================= */

  const isOwner =
    product?.sellerId !== undefined &&
    product?.sellerId !== null &&
    currentUser?.id !== undefined &&
    currentUser?.id !== null &&
    String(product.sellerId) === String(currentUser.id);

  /* =========================================
     TOAST
  ========================================= */

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = useCallback((message, type = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({
      show: true,
      message,
      type,
    });

    toastTimerRef.current = setTimeout(() => {
      setToast((current) => ({
        ...current,
        show: false,
      }));

      toastTimerRef.current = null;
    }, 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      if (loginTimerRef.current) {
        clearTimeout(loginTimerRef.current);
      }
    };
  }, []);

  /* =========================================
     FAVORITES
  ========================================= */

  const getUserFavorites = useCallback(
    (targetUserId) => {
      if (!targetUserId) {
        return [];
      }

      const savedFavorites = readStorage("benaFavorites", {});

      if (
        !savedFavorites ||
        typeof savedFavorites !== "object" ||
        Array.isArray(savedFavorites)
      ) {
        return [];
      }

      const userFavorites = savedFavorites[String(targetUserId)];

      return Array.isArray(userFavorites) ? userFavorites : [];
    },
    [readStorage],
  );

  const [favorites, setFavorites] = useState(() => getUserFavorites(userId));

  const isFavorite = product
    ? favorites.some((item) => String(item) === String(product.id))
    : false;

  /* =========================================
     CART
  ========================================= */

  const getUserCart = useCallback((targetUserId) => {
    if (!targetUserId) {
      return [];
    }

    try {
      const cart = getCart(String(targetUserId));

      return Array.isArray(cart) ? cart : [];
    } catch {
      return [];
    }
  }, []);

  const [cartIds, setCartIds] = useState(() => getUserCart(userId));

  const isInCart = product
    ? cartIds.some((item) => String(item) === String(product.id))
    : false;

  /* =========================================
     ORDERS
  ========================================= */

  const getOrders = useCallback(() => {
    const savedOrders = readStorage("benaOrders", []);

    return Array.isArray(savedOrders) ? savedOrders : [];
  }, [readStorage]);

  const [orders, setOrders] = useState(() => getOrders());

  /* =========================================
     PRODUCT ORDER INFO
  ========================================= */

  const productOrderInfo = useMemo(() => {
    if (!product) {
      return {
        order: null,
        status: null,
        buyerId: null,
        isCurrentBuyer: false,
        blocked: false,
        sold: false,
      };
    }

    const order = getRelevantProductOrder(orders, product.id);

    if (!order) {
      return {
        order: null,
        status: null,
        buyerId: null,
        isCurrentBuyer: false,
        blocked: false,
        sold: false,
      };
    }

    const status = normalizeOrderStatus(order.status);

    const buyerId = getOrderBuyerId(order);

    const isCurrentBuyer =
      Boolean(userId) && Boolean(buyerId) && String(userId) === String(buyerId);

    return {
      order,
      status,
      buyerId,
      isCurrentBuyer,

      blocked: ACTIVE_ORDER_STATUSES.includes(status),

      sold: status === "completed",
    };
  }, [orders, product, userId]);

  /* =========================================
     PURCHASE BUTTON STATE
  ========================================= */

  const purchaseButtonState = useMemo(() => {
    /*
        تم البيع
      */

    if (productOrderInfo.status === "completed") {
      return {
        type: "sold",

        text: productOrderInfo.isCurrentBuyer ? "تم الشراء" : "تم البيع",

        disabled: true,

        Icon: BadgeCheck,
      };
    }

    /*
        قيد التجهيز
      */

    if (productOrderInfo.status === "preparing") {
      return {
        type: productOrderInfo.isCurrentBuyer ? "my-order" : "reserved",

        text: productOrderInfo.isCurrentBuyer ? "طلبك قيد التجهيز" : "محجوز",

        disabled: true,

        Icon: PackageCheck,
      };
    }

    /*
        البائع وافق
      */

    if (productOrderInfo.status === "confirmed") {
      return {
        type: productOrderInfo.isCurrentBuyer ? "my-order" : "reserved",

        text: productOrderInfo.isCurrentBuyer ? "تم قبول طلبك" : "محجوز",

        disabled: true,

        Icon: Check,
      };
    }

    /*
        بانتظار رد البائع
      */

    if (productOrderInfo.status === "pending") {
      return {
        type: productOrderInfo.isCurrentBuyer ? "my-order" : "reserved",

        text: productOrderInfo.isCurrentBuyer
          ? "بانتظار رد البائع"
          : "قيد الطلب",

        disabled: true,

        Icon: productOrderInfo.isCurrentBuyer ? Clock3 : LockKeyhole,
      };
    }

    /*
        موجود في السلة
      */

    if (isInCart) {
      return {
        type: "in-cart",
        text: "عرض السلة",
        disabled: false,
        Icon: Check,
      };
    }

    /*
        متاح
      */

    return {
      type: "available",
      text: "أضف للسلة",
      disabled: false,
      Icon: ShoppingCart,
    };
  }, [productOrderInfo, isInCart]);

  /* =========================================
     REFRESH
  ========================================= */

  const refreshProducts = useCallback(() => {
    setSavedProducts(getSavedProducts());
  }, [getSavedProducts]);

  const refreshUsers = useCallback(() => {
    setUsers(getUsers());
  }, [getUsers]);

  const refreshUserData = useCallback(() => {
    const user = getCurrentUser();

    setCurrentUser(user);

    const targetUserId =
      user?.id !== undefined && user?.id !== null ? String(user.id) : null;

    setFavorites(getUserFavorites(targetUserId));

    setCartIds(getUserCart(targetUserId));
  }, [getCurrentUser, getUserFavorites, getUserCart]);

  const refreshOrders = useCallback(() => {
    setOrders(getOrders());
  }, [getOrders]);

  /* =========================================
     EVENTS
  ========================================= */

  useEffect(() => {
    const handleStorage = (event) => {
      if (!event.key || event.key === "benaProducts") {
        refreshProducts();
      }

      if (
        !event.key ||
        event.key === "benaUsers" ||
        event.key === "benaProfiles"
      ) {
        refreshUsers();
      }

      if (
        !event.key ||
        event.key === "benaCurrentUser" ||
        event.key === "benaFavorites" ||
        event.key === "benaCart"
      ) {
        refreshUserData();
      }

      if (!event.key || event.key === "benaOrders") {
        refreshOrders();
      }
    };

    window.addEventListener("storage", handleStorage);

    window.addEventListener("bena-products-updated", refreshProducts);

    window.addEventListener("bena-users-updated", refreshUsers);

    window.addEventListener("bena-profiles-updated", refreshUsers);

    window.addEventListener("bena-favorites-updated", refreshUserData);

    window.addEventListener("bena-cart-updated", refreshUserData);

    window.addEventListener("bena-orders-updated", refreshOrders);

    return () => {
      window.removeEventListener("storage", handleStorage);

      window.removeEventListener("bena-products-updated", refreshProducts);

      window.removeEventListener("bena-users-updated", refreshUsers);

      window.removeEventListener("bena-profiles-updated", refreshUsers);

      window.removeEventListener("bena-favorites-updated", refreshUserData);

      window.removeEventListener("bena-cart-updated", refreshUserData);

      window.removeEventListener("bena-orders-updated", refreshOrders);
    };
  }, [refreshProducts, refreshUsers, refreshUserData, refreshOrders]);

  /* =========================================
     IMAGE
  ========================================= */

  const getProductImage = (currentProduct) => {
    if (currentProduct?.image) {
      return currentProduct.image;
    }

    if (
      Array.isArray(currentProduct?.images) &&
      currentProduct.images.length > 0
    ) {
      return currentProduct.images[0];
    }

    return null;
  };

  const productImage = getProductImage(product);

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [productImage, id]);

  const hasProductImage = Boolean(productImage) && !imageError;

  /* =========================================
     CONDITION
  ========================================= */

  const getConditionClass = (currentProduct) => {
    if (["new", "excellent", "used"].includes(currentProduct?.conditionClass)) {
      return currentProduct.conditionClass;
    }

    if (currentProduct?.condition === "جديد") {
      return "new";
    }

    if (currentProduct?.condition === "ممتاز") {
      return "excellent";
    }

    return "used";
  };

  /* =========================================
     PRICE
  ========================================= */

  const getProductPrice = (price) => {
    const numericPrice = Number(price);

    return Number.isFinite(numericPrice) ? numericPrice.toLocaleString() : "0";
  };

  /* =========================================
     DATE
  ========================================= */

  const getPublishedText = (createdAt) => {
    if (!createdAt) {
      return "نُشر حديثًا";
    }

    const createdDate = new Date(createdAt);

    if (Number.isNaN(createdDate.getTime())) {
      return "نُشر حديثًا";
    }

    const now = new Date();

    const difference = now.getTime() - createdDate.getTime();

    if (difference < 0) {
      return "نُشر حديثًا";
    }

    const minutes = Math.floor(difference / 60000);

    const hours = Math.floor(difference / 3600000);

    const days = Math.floor(difference / 86400000);

    if (minutes < 1) {
      return "نُشر الآن";
    }

    if (minutes < 60) {
      return `نُشر منذ ${minutes} دقيقة`;
    }

    if (hours < 24) {
      if (hours === 1) {
        return "نُشر منذ ساعة";
      }

      if (hours === 2) {
        return "نُشر منذ ساعتين";
      }

      return `نُشر منذ ${hours} ساعات`;
    }

    if (days === 1) {
      return "نُشر منذ يوم";
    }

    if (days === 2) {
      return "نُشر منذ يومين";
    }

    if (days <= 7) {
      return `نُشر منذ ${days} أيام`;
    }

    return createdDate.toLocaleDateString("ar", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /* =========================================
     REQUIRE LOGIN
  ========================================= */

  const requireLogin = (callback) => {
    if (!currentUser || !userId) {
      showToast("سجل دخولك أولاً للمتابعة", "info");

      if (loginTimerRef.current) {
        clearTimeout(loginTimerRef.current);
      }

      loginTimerRef.current = setTimeout(() => {
        navigate("/login", {
          state: {
            from: `/products/${id}`,
          },
        });
      }, 650);

      return;
    }

    callback();
  };

  /* =========================================
     ADD TO CART
  ========================================= */

  const handleAddToCart = () => {
    requireLogin(() => {
      if (!product || !userId) {
        return;
      }

      if (isOwner) {
        showToast("لا يمكنك إضافة منتجك إلى السلة", "info");

        return;
      }

      /*
        مهم جدًا:
        نقرأ الطلبات من localStorage مباشرة
        قبل الإضافة.

        حتى لو state لم تتحدث لسبب ما،
        لا يمكن شراء منتج عليه طلب.
      */

      const latestOrders = getOrders();

      const existingOrder = getRelevantProductOrder(latestOrders, product.id);

      if (existingOrder) {
        const status = normalizeOrderStatus(existingOrder.status);

        const buyerId = getOrderBuyerId(existingOrder);

        const isCurrentBuyer =
          buyerId !== null && String(buyerId) === String(userId);

        setOrders(latestOrders);

        /* SOLD */

        if (status === "completed") {
          showToast(
            isCurrentBuyer
              ? "لقد اشتريت هذا المنتج بالفعل"
              : "عذرًا، تم بيع هذا المنتج",
            "info",
          );

          return;
        }

        /* PENDING */

        if (status === "pending") {
          showToast(
            isCurrentBuyer
              ? "طلبك بانتظار رد البائع"
              : "هذا المنتج قيد الطلب من مستخدم آخر",
            "info",
          );

          return;
        }

        /* CONFIRMED */

        if (status === "confirmed") {
          showToast(
            isCurrentBuyer
              ? "تم قبول طلبك لهذا المنتج"
              : "هذا المنتج محجوز حاليًا",
            "info",
          );

          return;
        }

        /* PREPARING */

        if (status === "preparing") {
          showToast(
            isCurrentBuyer
              ? "طلبك لهذا المنتج قيد التجهيز"
              : "هذا المنتج محجوز حاليًا",
            "info",
          );

          return;
        }
      }

      /*
        إذا كان متاحًا لكنه موجود
        في السلة، نفتح السلة.
      */

      if (isInCart) {
        navigate("/cart");

        return;
      }

      const imageElement = document.querySelector(".product-main-image img");

      const result = addToCart(userId, product.id);

      if (!result?.added) {
        setCartIds(
          Array.isArray(result?.cart) ? result.cart : getUserCart(userId),
        );

        showToast("المنتج موجود في السلة بالفعل", "info");

        return;
      }

      setCartIds(Array.isArray(result.cart) ? result.cart : []);

      if (imageElement) {
        animateProductToCart(imageElement);
      }

      window.dispatchEvent(new Event("bena-cart-updated"));

      showToast("تمت إضافة المنتج للسلة ✓", "success");
    });
  };

  /* =========================================
     FAVORITE
  ========================================= */

  const toggleFavorite = () => {
    requireLogin(() => {
      if (!product || !userId) {
        return;
      }

      if (isOwner) {
        showToast("هذا المنتج تابع لك", "info");

        return;
      }

      const savedFavorites = readStorage("benaFavorites", {});

      const favoritesObject =
        savedFavorites &&
        typeof savedFavorites === "object" &&
        !Array.isArray(savedFavorites)
          ? savedFavorites
          : {};

      const currentFavorites = Array.isArray(favoritesObject[userId])
        ? favoritesObject[userId]
        : [];

      const exists = currentFavorites.some(
        (item) => String(item) === String(product.id),
      );

      const updatedUserFavorites = exists
        ? currentFavorites.filter((item) => String(item) !== String(product.id))
        : [...currentFavorites, product.id];

      const updatedAllFavorites = {
        ...favoritesObject,

        [userId]: updatedUserFavorites,
      };

      try {
        localStorage.setItem(
          "benaFavorites",
          JSON.stringify(updatedAllFavorites),
        );
      } catch {
        showToast("تعذر تحديث المفضلة", "error");

        return;
      }

      setFavorites(updatedUserFavorites);

      window.dispatchEvent(new Event("bena-favorites-updated"));

      showToast(
        exists ? "تمت إزالة المنتج من المفضلة" : "تمت إضافة المنتج للمفضلة ✓",

        exists ? "info" : "success",
      );
    });
  };

  /* =========================================
     MESSAGE SELLER
  ========================================= */

  const handleMessageSeller = () => {
    requireLogin(() => {
      if (!product) {
        return;
      }

      if (isOwner) {
        showToast("هذا المنتج تابع لك", "info");

        return;
      }

      if (product.sellerId === undefined || product.sellerId === null) {
        showToast("لا يمكن مراسلة بائع هذا المنتج حاليًا", "info");

        return;
      }

      navigate(`/messages/${product.id}`);
    });
  };

  /* =========================================
     WHATSAPP
  ========================================= */

  const getWhatsAppNumber = (phone) => {
    const rawPhone = String(phone || "").trim();

    if (!rawPhone) {
      return "";
    }

    let digits = rawPhone.replace(/\D/g, "");

    if (!digits) {
      return "";
    }

    /* REMOVE 00 */

    if (digits.startsWith("00")) {
      digits = digits.slice(2);
    }

    /* INTERNATIONAL */

    if (digits.startsWith("970") || digits.startsWith("972")) {
      const localNumber = digits.slice(3);

      if (!/^(59|56)\d{7}$/.test(localNumber)) {
        return "";
      }

      return digits;
    }

    /* LOCAL WITH ZERO */

    if (digits.startsWith("059") || digits.startsWith("056")) {
      const localNumber = digits.slice(1);

      if (!/^(59|56)\d{7}$/.test(localNumber)) {
        return "";
      }

      return `970${localNumber}`;
    }

    /* LOCAL WITHOUT ZERO */

    if (digits.startsWith("59") || digits.startsWith("56")) {
      if (!/^(59|56)\d{7}$/.test(digits)) {
        return "";
      }

      return `970${digits}`;
    }

    return "";
  };

  const handleWhatsAppSeller = () => {
    requireLogin(() => {
      if (!product) {
        return;
      }

      if (isOwner) {
        showToast("هذا المنتج تابع لك", "info");

        return;
      }

      if (product.sellerId === undefined || product.sellerId === null) {
        showToast("لا يتوفر رقم واتساب لهذا المنتج", "info");

        return;
      }

      const whatsappNumber = getWhatsAppNumber(sellerPhone);

      if (!whatsappNumber) {
        showToast("البائع لم يضف رقم واتساب صحيح بعد", "info");

        return;
      }

      const productName = product.name || "المنتج";

      const productPrice = getProductPrice(product.price);

      const productUrl = window.location.href;

      const message =
        `مرحبًا ${sellerName}،\n` +
        `أتواصل معك من منصة بينا بخصوص المنتج:\n` +
        `${productName}\n` +
        `السعر: ${productPrice} ₪\n` +
        `${productUrl}`;

      const whatsappUrl =
        `https://wa.me/${whatsappNumber}` +
        `?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    });
  };

  /* =========================================
     SHARE
  ========================================= */

  const handleShare = async () => {
    if (!product) {
      return;
    }

    const shareUrl = window.location.href;

    const shareData = {
      title: product.name || "منتج على بينا",

      text: product.name
        ? `شاهد ${product.name} على بينا`
        : "شاهد هذا المنتج على بينا",

      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);

        return;
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }
      }
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);

        showToast("تم نسخ رابط المنتج ✓", "success");

        return;
      }

      throw new Error("Clipboard unavailable");
    } catch {
      showToast("تعذر مشاركة رابط المنتج", "error");
    }
  };

  /* =========================================
     NOT FOUND
  ========================================= */

  if (!product) {
    return (
      <>
        <Navbar />

        <main className="product-not-found" dir="rtl">
          <ImageOff size={42} />

          <h2>المنتج غير موجود</h2>

          <p>قد يكون المنتج قد تم حذفه أو لم يعد متوفرًا.</p>

          <button type="button" onClick={() => navigate("/products")}>
            العودة للمنتجات
          </button>
        </main>
      </>
    );
  }

  /* BUTTON ICON */

  const PurchaseIcon = purchaseButtonState.Icon;

  /* =========================================
     RENDER
  ========================================= */

  return (
    <>
      <Navbar />

      <main className="product-details-page" dir="rtl">
        <Toast show={toast.show} message={toast.message} type={toast.type} />

        <div className="product-details-container">
          {/* BACK */}

          <button
            type="button"
            className="product-back-btn"
            onClick={() => navigate("/")}
          >
            <ArrowRight size={19} />

            <span>العودة للرئيسية</span>
          </button>

          <div className="product-details-grid">
            {/* IMAGE */}

            <div className="product-gallery">
              <div className="product-main-image">
                {hasProductImage ? (
                  <img
                    src={productImage}
                    alt={product.name || "صورة المنتج"}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="product-image-fallback">
                    <ImageOff size={46} />

                    <span>لا توجد صورة</span>
                  </div>
                )}

                <span
                  className={`details-condition ${getConditionClass(product)}`}
                >
                  {product.condition || "مستخدم"}
                </span>

                {!isOwner && (
                  <button
                    type="button"
                    className={`details-favorite ${isFavorite ? "active" : ""}`}
                    aria-label={
                      isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"
                    }
                    aria-pressed={isFavorite}
                    onClick={toggleFavorite}
                  >
                    <Heart
                      size={21}
                      fill={isFavorite ? "currentColor" : "none"}
                    />
                  </button>
                )}
              </div>
            </div>

            {/* INFO */}

            <div className="product-info">
              <div className="product-info-top">
                <div>
                  <span className="product-category">
                    {product.category || "أخرى"}
                  </span>

                  <h1>{product.name || "منتج"}</h1>
                </div>

                <button
                  type="button"
                  className="share-button"
                  aria-label="مشاركة المنتج"
                  onClick={handleShare}
                >
                  <Share2 size={18} />
                </button>
              </div>

              {/* PRICE */}

              <div className="details-price">
                <strong>{getProductPrice(product.price)}</strong>

                <span>₪</span>
              </div>

              {/* ORDER STATUS */}

              {!isOwner && productOrderInfo.status && (
                <div
                  className={`product-order-status product-order-status--${purchaseButtonState.type}`}
                >
                  <PurchaseIcon size={18} />

                  <div>
                    <strong>{purchaseButtonState.text}</strong>

                    <span>
                      {productOrderInfo.status === "pending" &&
                        productOrderInfo.isCurrentBuyer &&
                        "تم إرسال طلبك، وبانتظار رد البائع."}

                      {productOrderInfo.status === "pending" &&
                        !productOrderInfo.isCurrentBuyer &&
                        "يوجد طلب حالي على هذا المنتج."}

                      {productOrderInfo.status === "confirmed" &&
                        productOrderInfo.isCurrentBuyer &&
                        "وافق البائع على طلبك."}

                      {productOrderInfo.status === "confirmed" &&
                        !productOrderInfo.isCurrentBuyer &&
                        "المنتج محجوز لمستخدم آخر."}

                      {productOrderInfo.status === "preparing" &&
                        productOrderInfo.isCurrentBuyer &&
                        "البائع يقوم بتجهيز طلبك."}

                      {productOrderInfo.status === "preparing" &&
                        !productOrderInfo.isCurrentBuyer &&
                        "المنتج محجوز وغير متاح للشراء حاليًا."}

                      {productOrderInfo.status === "completed" &&
                        productOrderInfo.isCurrentBuyer &&
                        "تم إكمال عملية شراء هذا المنتج."}

                      {productOrderInfo.status === "completed" &&
                        !productOrderInfo.isCurrentBuyer &&
                        "هذا المنتج تم بيعه ولم يعد متاحًا للشراء."}
                    </span>
                  </div>
                </div>
              )}

              {/* META */}

              <div className="details-meta">
                <div>
                  <MapPin size={17} />

                  <span>{product.location || "غير محدد"}</span>
                </div>

                <div>
                  <Clock size={17} />

                  <span>{getPublishedText(product.createdAt)}</span>
                </div>
              </div>

              <div className="details-divider" />

              {/* DESCRIPTION */}

              <div className="product-description">
                <h3>وصف المنتج</h3>

                <p>{product.description || "لا يوجد وصف لهذا المنتج."}</p>
              </div>

              <div className="details-divider" />

              {/* SELLER */}

              <div className="seller-section">
                <h3>معلومات البائع</h3>

                <div className="seller-card">
                  <div className="seller-avatar">
                    <UserRound size={25} />
                  </div>

                  <div className="seller-info">
                    <strong>
                      {isOwner
                        ? `${currentUser?.name || sellerName} - أنت`
                        : sellerName}
                    </strong>

                    <span>
                      <ShieldCheck size={14} />

                      {isOwner
                        ? "هذا المنتج تابع لك"
                        : product.sellerId !== undefined &&
                            product.sellerId !== null
                          ? "حساب على منصة بينا"
                          : "منتج تجريبي على منصة بينا"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="product-actions">
                {isOwner ? (
                  <button
                    type="button"
                    className="message-seller-btn"
                    onClick={() => navigate(`/edit-product/${product.id}`)}
                  >
                    <Pencil size={19} />
                    تعديل المنتج
                  </button>
                ) : (
                  <>
                    {/* CART / ORDER STATUS */}

                    <button
                      type="button"
                      disabled={purchaseButtonState.disabled}
                      className={`details-cart-btn ${
                        purchaseButtonState.type === "in-cart" ? "in-cart" : ""
                      } ${
                        purchaseButtonState.type === "my-order"
                          ? "order-pending"
                          : ""
                      } ${
                        purchaseButtonState.type === "reserved"
                          ? "order-reserved"
                          : ""
                      } ${
                        purchaseButtonState.type === "sold" ? "order-sold" : ""
                      }`}
                      onClick={handleAddToCart}
                    >
                      <PurchaseIcon size={19} />

                      {purchaseButtonState.text}
                    </button>

                    {/* MESSAGE */}

                    <button
                      type="button"
                      className="message-seller-btn"
                      onClick={handleMessageSeller}
                    >
                      <MessageCircle size={19} />
                      مراسلة البائع
                    </button>

                    {/* WHATSAPP */}

                    <button
                      type="button"
                      className="whatsapp-seller-btn"
                      onClick={handleWhatsAppSeller}
                    >
                      <Phone size={19} />
                      واتساب
                    </button>

                    {/* FAVORITE */}

                    <button
                      type="button"
                      className={`favorite-product-btn ${
                        isFavorite ? "active" : ""
                      }`}
                      aria-pressed={isFavorite}
                      onClick={toggleFavorite}
                    >
                      <Heart
                        size={19}
                        fill={isFavorite ? "currentColor" : "none"}
                      />

                      {isFavorite ? "تمت الإضافة للمفضلة" : "إضافة للمفضلة"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default ProductDetails;
