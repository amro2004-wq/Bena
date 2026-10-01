import "./Products.css";

import { defaultProducts } from "../data/products";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import Toast from "../components/Toast";
import Navbar from "../components/Navbar";

import { addToCart, animateProductToCart, getCart } from "../utils/cart";

import {
  Search,
  MapPin,
  Heart,
  SlidersHorizontal,
  ArrowRight,
  Trash2,
  TriangleAlert,
  X,
  ShoppingCart,
  Check,
  ImageOff,
  Clock3,
  PackageCheck,
  LockKeyhole,
  BadgeCheck,
} from "lucide-react";

/* CATEGORIES */

const categories = [
  "الكل",
  "إلكترونيات",
  "موبايلات",
  "كمبيوتر ولابتوب",
  "ألعاب وإكسسوارات",
  "أجهزة منزلية",
  "أثاث",
  "ملابس",
  "أحذية",
  "حقائب وإكسسوارات",
  "ساعات ومجوهرات",
  "عناية شخصية وتجميل",
  "أطفال ورضع",
  "ألعاب أطفال",
  "كتب وقرطاسية",
  "رياضة ولياقة",
  "سيارات وقطع غيار",
  "دراجات",
  "أدوات ومعدات",
  "مستلزمات منزلية",
  "حديقة وزراعة",
  "حيوانات ومستلزماتها",
  "مأكولات ومنتجات منزلية",
  "هوايات ومقتنيات",
  "أخرى",
];

const locations = ["غزة", "شمال غزة", "دير البلح", "خان يونس", "رفح"];

/* ORDER HELPERS */

const normalizeOrderStatus = (status) =>
  String(status || "")
    .trim()
    .toLowerCase();

const ORDER_STATUS_PRIORITY = {
  completed: 4,
  preparing: 3,
  confirmed: 2,
  pending: 1,
};

const getOrderBuyerId = (order) => {
  const id =
    order?.buyerId ??
    order?.userId ??
    order?.buyer?.id ??
    order?.user?.id ??
    null;

  if (id === undefined || id === null || id === "") {
    return null;
  }

  return String(id);
};

const getOrderProductIds = (order) => {
  const ids = [];

  const addId = (value) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    ids.push(String(value));
  };

  if (Array.isArray(order?.products)) {
    order.products.forEach((item) => {
      if (item && typeof item === "object") {
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

  if (Array.isArray(order?.items)) {
    order.items.forEach((item) => {
      if (item && typeof item === "object") {
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

  addId(order?.productId);

  return [...new Set(ids)];
};

const orderContainsProduct = (order, productId) => {
  const targetId = String(productId);

  return getOrderProductIds(order).some((id) => id === targetId);
};

const getOrderTime = (order) => {
  const values = [
    order?.updatedAt,
    order?.createdAt,
    order?.date,
    order?.orderDate,
  ];

  for (const value of values) {
    const time = new Date(value || "").getTime();

    if (Number.isFinite(time)) {
      return time;
    }
  }

  const numericId = Number(order?.id);

  return Number.isFinite(numericId) ? numericId : 0;
};

const getRelevantProductOrder = (orders, productId) => {
  if (!Array.isArray(orders)) {
    return null;
  }

  const relevantOrders = orders
    .filter((order) => {
      const status = normalizeOrderStatus(order?.status);

      return (
        Object.prototype.hasOwnProperty.call(ORDER_STATUS_PRIORITY, status) &&
        orderContainsProduct(order, productId)
      );
    })
    .sort((a, b) => {
      const aStatus = normalizeOrderStatus(a?.status);
      const bStatus = normalizeOrderStatus(b?.status);

      const priorityDifference =
        (ORDER_STATUS_PRIORITY[bStatus] || 0) -
        (ORDER_STATUS_PRIORITY[aStatus] || 0);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return getOrderTime(b) - getOrderTime(a);
    });

  return relevantOrders[0] || null;
};

function Products() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const [searchParams] = useSearchParams();

  const toastTimerRef = useRef(null);
  const redirectTimersRef = useRef([]);

  /* STORAGE */

  const readStorage = useCallback((key, fallback) => {
    try {
      const value = localStorage.getItem(key);

      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }, []);

  /* USER */

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

  /* URL */

  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "الكل";

  /* PRODUCTS */

  const getSavedProducts = useCallback(() => {
    const saved = readStorage("benaProducts", []);

    return Array.isArray(saved) ? saved : [];
  }, [readStorage]);

  const [savedProducts, setSavedProducts] = useState(() => getSavedProducts());

  const [failedImageIds, setFailedImageIds] = useState(() => new Set());

  const products = useMemo(() => {
    const defaults = Array.isArray(defaultProducts) ? defaultProducts : [];

    const productsMap = new Map();

    defaults.forEach((product) => {
      if (product?.id !== undefined && product?.id !== null) {
        productsMap.set(String(product.id), product);
      }
    });

    savedProducts.forEach((product) => {
      if (product?.id !== undefined && product?.id !== null) {
        productsMap.set(String(product.id), product);
      }
    });

    return Array.from(productsMap.values());
  }, [savedProducts]);

  /* FILTERS */

  const [search, setSearch] = useState(initialSearch);

  const [category, setCategory] = useState(
    categories.includes(initialCategory) ? initialCategory : "الكل",
  );

  const [condition, setCondition] = useState("الكل");
  const [location, setLocation] = useState("الكل");
  const [sort, setSort] = useState("latest");

  /* FAVORITES */

  const getUserFavorites = useCallback(
    (id) => {
      if (!id) {
        return [];
      }

      const allFavorites = readStorage("benaFavorites", {});

      if (
        !allFavorites ||
        typeof allFavorites !== "object" ||
        Array.isArray(allFavorites)
      ) {
        return [];
      }

      const userFavorites = allFavorites[String(id)];

      return Array.isArray(userFavorites) ? userFavorites : [];
    },
    [readStorage],
  );

  const [favorites, setFavorites] = useState(() => getUserFavorites(userId));

  /* CART */

  const getUserCart = useCallback((id) => {
    if (!id) {
      return [];
    }

    try {
      const cart = getCart(String(id));

      return Array.isArray(cart) ? cart : [];
    } catch {
      return [];
    }
  }, []);

  const [cartIds, setCartIds] = useState(() => getUserCart(userId));

  /* ORDERS */

  const getOrders = useCallback(() => {
    const savedOrders = readStorage("benaOrders", []);

    return Array.isArray(savedOrders) ? savedOrders : [];
  }, [readStorage]);

  const [orders, setOrders] = useState(() => getOrders());

  /* DELETE */

  const [productToDelete, setProductToDelete] = useState(null);

  /* TOAST */

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
    }, 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      redirectTimersRef.current.forEach((timerId) => {
        clearTimeout(timerId);
      });

      redirectTimersRef.current = [];
    };
  }, []);

  /* REFRESH */

  const refreshProducts = useCallback(() => {
    setSavedProducts(getSavedProducts());
    setFailedImageIds(new Set());
  }, [getSavedProducts]);

  const refreshFavorites = useCallback(() => {
    const user = getCurrentUser();

    const id =
      user?.id !== undefined && user?.id !== null ? String(user.id) : null;

    setCurrentUser(user);
    setFavorites(getUserFavorites(id));
  }, [getCurrentUser, getUserFavorites]);

  const refreshCart = useCallback(() => {
    const user = getCurrentUser();

    const id =
      user?.id !== undefined && user?.id !== null ? String(user.id) : null;

    setCurrentUser(user);
    setCartIds(getUserCart(id));
  }, [getCurrentUser, getUserCart]);

  const refreshOrders = useCallback(() => {
    setOrders(getOrders());
  }, [getOrders]);

  /* EVENTS */

  useEffect(() => {
    const handleStorage = (event) => {
      if (!event.key || event.key === "benaProducts") {
        refreshProducts();
      }

      if (!event.key || event.key === "benaFavorites") {
        refreshFavorites();
      }

      if (!event.key || event.key === "benaCart") {
        refreshCart();
      }

      if (!event.key || event.key === "benaOrders") {
        refreshOrders();
      }

      if (!event.key || event.key === "benaCurrentUser") {
        refreshFavorites();
        refreshCart();
        refreshOrders();
      }
    };

    window.addEventListener("storage", handleStorage);

    window.addEventListener("bena-products-updated", refreshProducts);
    window.addEventListener("bena-favorites-updated", refreshFavorites);
    window.addEventListener("bena-cart-updated", refreshCart);
    window.addEventListener("bena-orders-updated", refreshOrders);

    return () => {
      window.removeEventListener("storage", handleStorage);

      window.removeEventListener("bena-products-updated", refreshProducts);
      window.removeEventListener("bena-favorites-updated", refreshFavorites);
      window.removeEventListener("bena-cart-updated", refreshCart);
      window.removeEventListener("bena-orders-updated", refreshOrders);
    };
  }, [refreshProducts, refreshFavorites, refreshCart, refreshOrders]);

  /* URL SYNC */

  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlCategory = searchParams.get("category") || "الكل";

    setSearch(urlSearch);

    setCategory(categories.includes(urlCategory) ? urlCategory : "الكل");
  }, [searchParams, routerLocation.search]);

  /* DELETE MODAL */

  useEffect(() => {
    if (!productToDelete) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProductToDelete(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleEscape);
    };
  }, [productToDelete]);

  /* OWNER */

  const isOwner = (product) => {
    if (
      !currentUser ||
      product?.sellerId === undefined ||
      product?.sellerId === null
    ) {
      return false;
    }

    return String(product.sellerId) === String(currentUser.id);
  };

  /* IMAGE */

  const getProductImage = (product) => {
    if (product?.image) {
      return product.image;
    }

    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images[0];
    }

    return null;
  };

  /* PRICE */

  const getProductPrice = (product) => {
    const price = Number(product?.price);

    return Number.isFinite(price) && price >= 0 ? price : 0;
  };

  /* CONDITION */

  const getConditionClass = (product) => {
    if (["new", "excellent", "used"].includes(product?.conditionClass)) {
      return product.conditionClass;
    }

    if (product?.condition === "جديد") {
      return "new";
    }

    if (product?.condition === "ممتاز") {
      return "excellent";
    }

    return "used";
  };

  /* LOGIN REDIRECT */

  const redirectToLogin = () => {
    const timerId = setTimeout(() => {
      redirectTimersRef.current = redirectTimersRef.current.filter(
        (id) => id !== timerId,
      );

      navigate("/login", {
        state: {
          from:
            routerLocation.pathname +
            routerLocation.search +
            routerLocation.hash,
        },
      });
    }, 650);

    redirectTimersRef.current.push(timerId);
  };

  /* CART */

  const isInCart = (id) => {
    return cartIds.some((item) => String(item) === String(id));
  };

  /* PRODUCT ORDER */

  const getProductOrderInfo = (productId) => {
    const order = getRelevantProductOrder(orders, productId);

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
      blocked: ["pending", "confirmed", "preparing", "completed"].includes(
        status,
      ),
      sold: status === "completed",
    };
  };

  /* PURCHASE BUTTON */

  const getPurchaseButtonState = (product) => {
    const orderInfo = getProductOrderInfo(product.id);

    if (orderInfo.status === "completed") {
      return {
        type: "sold",
        text: orderInfo.isCurrentBuyer ? "تم الشراء" : "تم البيع",
        disabled: true,
        icon: BadgeCheck,
      };
    }

    if (orderInfo.status === "preparing") {
      return {
        type: orderInfo.isCurrentBuyer ? "my-order" : "reserved",
        text: orderInfo.isCurrentBuyer ? "طلبك قيد التجهيز" : "محجوز",
        disabled: true,
        icon: PackageCheck,
      };
    }

    if (orderInfo.status === "confirmed") {
      return {
        type: orderInfo.isCurrentBuyer ? "my-order" : "reserved",
        text: orderInfo.isCurrentBuyer ? "تم قبول طلبك" : "محجوز",
        disabled: true,
        icon: Check,
      };
    }

    if (orderInfo.status === "pending") {
      return {
        type: orderInfo.isCurrentBuyer ? "my-order" : "reserved",
        text: orderInfo.isCurrentBuyer ? "بانتظار رد البائع" : "قيد الطلب",
        disabled: true,
        icon: orderInfo.isCurrentBuyer ? Clock3 : LockKeyhole,
      };
    }

    if (isInCart(product.id)) {
      return {
        type: "in-cart",
        text: "عرض السلة",
        disabled: false,
        icon: Check,
      };
    }

    return {
      type: "available",
      text: "أضف للسلة",
      disabled: false,
      icon: ShoppingCart,
    };
  };

  const handleAddToCart = (event, product) => {
    event.stopPropagation();

    if (!currentUser || !userId) {
      showToast("سجل دخولك أولاً لإضافة المنتجات للسلة", "info");

      redirectToLogin();

      return;
    }

    if (isOwner(product)) {
      showToast("لا يمكنك إضافة منتجك إلى السلة", "info");

      return;
    }

    /*
      نقرأ الطلبات مباشرة من localStorage أيضًا.
      هذا يمنع الإضافة حتى لو state لم تتحدث بعد.
    */

    const latestOrders = getOrders();

    const existingOrder = getRelevantProductOrder(latestOrders, product.id);

    if (existingOrder) {
      const status = normalizeOrderStatus(existingOrder.status);

      const buyerId = getOrderBuyerId(existingOrder);

      const isCurrentBuyer =
        buyerId !== null && String(buyerId) === String(userId);

      refreshOrders();

      if (status === "completed") {
        showToast(
          isCurrentBuyer
            ? "لقد اشتريت هذا المنتج بالفعل"
            : "عذرًا، تم بيع هذا المنتج",
          "info",
        );

        return;
      }

      if (status === "pending") {
        showToast(
          isCurrentBuyer
            ? "طلبك بانتظار رد البائع"
            : "هذا المنتج قيد الطلب من مستخدم آخر",
          "info",
        );

        return;
      }

      if (status === "confirmed") {
        showToast(
          isCurrentBuyer
            ? "تم قبول طلبك لهذا المنتج"
            : "هذا المنتج محجوز حاليًا",
          "info",
        );

        return;
      }

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

    if (isInCart(product.id)) {
      navigate("/cart");

      return;
    }

    const productCard = event.currentTarget.closest(".all-product-card");

    const productImage = productCard?.querySelector(".all-product-image img");

    const result = addToCart(userId, product.id);

    if (!result?.added) {
      showToast("المنتج موجود في السلة بالفعل", "info");

      refreshCart();

      return;
    }

    setCartIds(Array.isArray(result.cart) ? result.cart : []);

    if (productImage) {
      animateProductToCart(productImage);
    }

    window.dispatchEvent(new Event("bena-cart-updated"));

    showToast("تمت إضافة المنتج للسلة ✓", "success");
  };

  /* FAVORITES */

  const isFavorite = (id) => {
    return favorites.some((item) => String(item) === String(id));
  };

  const toggleFavorite = (id) => {
    if (!currentUser || !userId) {
      showToast("سجل دخولك أولاً لإضافة المنتجات للمفضلة", "info");

      redirectToLogin();

      return;
    }

    setFavorites((current) => {
      const exists = current.some((item) => String(item) === String(id));

      const updated = exists
        ? current.filter((item) => String(item) !== String(id))
        : [...current, id];

      const savedFavorites = readStorage("benaFavorites", {});

      const favoritesObject =
        savedFavorites &&
        typeof savedFavorites === "object" &&
        !Array.isArray(savedFavorites)
          ? savedFavorites
          : {};

      const updatedAllFavorites = {
        ...favoritesObject,
        [userId]: updated,
      };

      try {
        localStorage.setItem(
          "benaFavorites",
          JSON.stringify(updatedAllFavorites),
        );
      } catch {
        showToast("تعذر تحديث المفضلة", "error");

        return current;
      }

      window.dispatchEvent(new Event("bena-favorites-updated"));

      showToast(
        exists ? "تمت إزالة المنتج من المفضلة" : "تمت إضافة المنتج للمفضلة ✓",
        exists ? "info" : "success",
      );

      return updated;
    });
  };

  /* DELETE MODAL */

  const openDeleteModal = (product) => {
    if (!isOwner(product)) {
      showToast("لا يمكنك حذف منتج تابع لمستخدم آخر", "error");

      return;
    }

    setProductToDelete(product);
  };

  const closeDeleteModal = () => {
    setProductToDelete(null);
  };

  /* FILTER PRODUCTS */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const searchValue = search.trim().toLowerCase();

      result = result.filter((product) => {
        const name = String(product?.name || "").toLowerCase();

        const description = String(product?.description || "").toLowerCase();

        const productCategory = String(product?.category || "").toLowerCase();

        const productLocation = String(product?.location || "").toLowerCase();

        return (
          name.includes(searchValue) ||
          description.includes(searchValue) ||
          productCategory.includes(searchValue) ||
          productLocation.includes(searchValue)
        );
      });
    }

    if (category !== "الكل") {
      result = result.filter((product) => product?.category === category);
    }

    if (condition !== "الكل") {
      result = result.filter((product) => product?.condition === condition);
    }

    if (location !== "الكل") {
      result = result.filter((product) => product?.location === location);
    }

    if (sort === "latest") {
      result.sort((a, b) => {
        const aDate = Date.parse(a?.createdAt || "");
        const bDate = Date.parse(b?.createdAt || "");

        if (
          Number.isFinite(aDate) &&
          Number.isFinite(bDate) &&
          aDate !== bDate
        ) {
          return bDate - aDate;
        }

        if (Number.isFinite(bDate) && !Number.isFinite(aDate)) {
          return 1;
        }

        if (Number.isFinite(aDate) && !Number.isFinite(bDate)) {
          return -1;
        }

        const aId = Number(a?.id);
        const bId = Number(b?.id);

        if (Number.isFinite(aId) && Number.isFinite(bId)) {
          return bId - aId;
        }

        return String(b?.id || "").localeCompare(String(a?.id || ""));
      });
    }

    if (sort === "low") {
      result.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    }

    if (sort === "high") {
      result.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    }

    return result;
  }, [products, search, category, condition, location, sort]);

  /* DELETE PRODUCT */

  const deleteProduct = () => {
    if (!productToDelete) {
      return;
    }

    if (!isOwner(productToDelete)) {
      closeDeleteModal();

      showToast("لا يمكنك حذف منتج تابع لمستخدم آخر", "error");

      return;
    }

    const productId = productToDelete.id;

    const updatedProducts = savedProducts.filter(
      (item) => String(item?.id) !== String(productId),
    );

    try {
      localStorage.setItem("benaProducts", JSON.stringify(updatedProducts));
    } catch {
      showToast("تعذر حذف المنتج", "error");

      return;
    }

    setSavedProducts(updatedProducts);

    window.dispatchEvent(new Event("bena-products-updated"));

    /* FAVORITES */

    const savedFavorites = readStorage("benaFavorites", {});

    const allFavorites =
      savedFavorites &&
      typeof savedFavorites === "object" &&
      !Array.isArray(savedFavorites)
        ? savedFavorites
        : {};

    const updatedAllFavorites = {};

    Object.entries(allFavorites).forEach(([favoriteUserId, ids]) => {
      updatedAllFavorites[favoriteUserId] = Array.isArray(ids)
        ? ids.filter((favoriteId) => String(favoriteId) !== String(productId))
        : [];
    });

    try {
      localStorage.setItem(
        "benaFavorites",
        JSON.stringify(updatedAllFavorites),
      );
    } catch {
      // المنتج حُذف بالفعل، لذلك لا نوقف بقية التنظيف
    }

    setFavorites(userId ? updatedAllFavorites[userId] || [] : []);

    window.dispatchEvent(new Event("bena-favorites-updated"));

    /* CART */

    const savedCarts = readStorage("benaCart", {});

    const allCarts =
      savedCarts && typeof savedCarts === "object" && !Array.isArray(savedCarts)
        ? savedCarts
        : {};

    const updatedAllCarts = {};

    Object.entries(allCarts).forEach(([cartUserId, ids]) => {
      updatedAllCarts[cartUserId] = Array.isArray(ids)
        ? ids.filter(
            (cartProductId) => String(cartProductId) !== String(productId),
          )
        : [];
    });

    try {
      localStorage.setItem("benaCart", JSON.stringify(updatedAllCarts));
    } catch {
      // المنتج حُذف بالفعل، لذلك لا نوقف بقية التنظيف
    }

    setCartIds(userId ? updatedAllCarts[userId] || [] : []);

    window.dispatchEvent(new Event("bena-cart-updated"));

    /* CHATS */

    const savedChats = readStorage("benaMessages", {});

    const chats =
      savedChats && typeof savedChats === "object" && !Array.isArray(savedChats)
        ? savedChats
        : {};

    const updatedChats = {};

    Object.entries(chats).forEach(([conversationId, conversation]) => {
      let conversationProductId = null;

      if (
        conversation &&
        typeof conversation === "object" &&
        !Array.isArray(conversation) &&
        conversation.productId !== undefined &&
        conversation.productId !== null
      ) {
        conversationProductId = conversation.productId;
      }

      if (conversationProductId === null && Array.isArray(conversation)) {
        const firstMessage = conversation[0];

        if (
          firstMessage?.productId !== undefined &&
          firstMessage?.productId !== null
        ) {
          conversationProductId = firstMessage.productId;
        }
      }

      if (conversationProductId === null) {
        const separatorIndex = conversationId.indexOf("_");

        conversationProductId =
          separatorIndex === -1
            ? conversationId
            : conversationId.slice(0, separatorIndex);
      }

      if (String(conversationProductId) !== String(productId)) {
        updatedChats[conversationId] = conversation;
      }
    });

    try {
      localStorage.setItem("benaMessages", JSON.stringify(updatedChats));
    } catch {
      // المنتج حُذف بالفعل، لذلك لا نوقف بقية التنظيف
    }

    window.dispatchEvent(new Event("bena-messages-updated"));

    /* NOTIFICATIONS */

    const savedNotifications = readStorage("benaNotifications", []);

    const notifications = Array.isArray(savedNotifications)
      ? savedNotifications
      : [];

    const updatedNotifications = notifications.filter((notification) => {
      if (!notification || typeof notification !== "object") {
        return true;
      }

      if (
        notification.productId !== undefined &&
        notification.productId !== null &&
        String(notification.productId) === String(productId)
      ) {
        return false;
      }

      const productLink = `/products/${productId}`;
      const legacyProductLink = `/product/${productId}`;
      const messageLinkStart = `/messages/${productId}`;

      const notificationLink = String(notification.link || "");
      const conversationId = String(notification.conversationId || "");

      return !(
        notificationLink === productLink ||
        notificationLink === legacyProductLink ||
        notificationLink.startsWith(messageLinkStart) ||
        conversationId.startsWith(`${productId}_`)
      );
    });

    try {
      localStorage.setItem(
        "benaNotifications",
        JSON.stringify(updatedNotifications),
      );
    } catch {
      // المنتج حُذف بالفعل، لذلك لا نوقف بقية التنظيف
    }

    window.dispatchEvent(new Event("bena-notifications-updated"));

    closeDeleteModal();

    showToast("تم حذف المنتج بنجاح ✓", "success");
  };

  /* CATEGORY */

  const handleCategoryChange = (item) => {
    setCategory(item);

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (item !== "الكل") {
      params.set("category", item);
    }

    const query = params.toString();

    navigate(query ? `/products?${query}` : "/products");
  };

  /* RESET */

  const resetFilters = () => {
    setSearch("");
    setCategory("الكل");
    setCondition("الكل");
    setLocation("الكل");
    setSort("latest");

    navigate("/products");
  };

  /* PRODUCT KEYBOARD */

  const handleProductKeyDown = (event, productId) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      navigate(`/products/${productId}`);
    }
  };

  return (
    <>
      <Navbar />

      <main className="products-page" dir="rtl">
        <Toast show={toast.show} message={toast.message} type={toast.type} />

        <div className="products-page__container">
          <button
            type="button"
            className="products-back-button"
            onClick={() => navigate("/")}
          >
            <ArrowRight size={19} />

            <span>العودة للرئيسية</span>
          </button>

          <div className="products-page__heading">
            <div>
              <span>تسوّق بسهولة</span>

              <h1>كل المنتجات</h1>

              <p>اكتشف المنتجات المعروضة من مستخدمي بينا داخل قطاع غزة.</p>
            </div>

            <button
              type="button"
              className="products-sell-btn"
              onClick={() => navigate("/sell")}
            >
              بيع منتج
            </button>
          </div>

          {/* SEARCH */}

          <div className="products-search">
            <Search size={20} aria-hidden="true" />

            <input
              type="search"
              placeholder="ابحث عن منتج..."
              aria-label="البحث عن منتج"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {/* CATEGORIES */}

          <div className="products-categories">
            {categories.map((item) => (
              <button
                type="button"
                key={item}
                className={category === item ? "active" : ""}
                aria-pressed={category === item}
                onClick={() => handleCategoryChange(item)}
              >
                {item === "الكل" ? "كل التصنيفات" : item}
              </button>
            ))}
          </div>

          <div className="products-layout">
            {/* FILTERS */}

            <aside className="products-filters">
              <div className="filters-title">
                <SlidersHorizontal size={18} aria-hidden="true" />

                <h3>تصفية النتائج</h3>
              </div>

              <div className="filter-group">
                <label htmlFor="condition-filter">الحالة</label>

                <select
                  id="condition-filter"
                  value={condition}
                  onChange={(event) => setCondition(event.target.value)}
                >
                  <option value="الكل">كل الحالات</option>
                  <option value="جديد">جديد</option>
                  <option value="ممتاز">ممتاز</option>
                  <option value="مستخدم">مستخدم</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="location-filter">الموقع</label>

                <select
                  id="location-filter"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                >
                  <option value="الكل">كل المناطق</option>

                  {locations.map((item) => (
                    <option value={item} key={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="reset-filters"
                onClick={resetFilters}
              >
                مسح الفلاتر
              </button>
            </aside>

            {/* RESULTS */}

            <section className="products-results">
              <div className="products-results__top">
                <p aria-live="polite">
                  <strong>{filteredProducts.length}</strong> منتجات
                </p>

                <select
                  aria-label="ترتيب المنتجات"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="latest">الأحدث</option>
                  <option value="low">السعر: الأقل أولاً</option>
                  <option value="high">السعر: الأعلى أولاً</option>
                </select>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="all-products-grid">
                  {filteredProducts.map((product) => {
                    const productImage = getProductImage(product);

                    const favorite = isFavorite(product.id);

                    const owner = isOwner(product);

                    const buttonState = getPurchaseButtonState(product);

                    const ButtonIcon = buttonState.icon;

                    return (
                      <article
                        key={product.id}
                        className="all-product-card"
                        role="link"
                        tabIndex={0}
                        aria-label={`عرض ${product.name || "المنتج"}`}
                        onClick={() => navigate(`/products/${product.id}`)}
                        onKeyDown={(event) =>
                          handleProductKeyDown(event, product.id)
                        }
                      >
                        <div className="all-product-image">
                          {productImage &&
                          !failedImageIds.has(String(product.id)) ? (
                            <img
                              src={productImage}
                              alt={product.name || "منتج"}
                              onError={() => {
                                setFailedImageIds((current) => {
                                  const updated = new Set(current);

                                  updated.add(String(product.id));

                                  return updated;
                                });
                              }}
                            />
                          ) : (
                            <div className="all-product-image-fallback">
                              <ImageOff size={32} aria-hidden="true" />
                            </div>
                          )}

                          {!owner && (
                            <button
                              type="button"
                              className={`all-product-heart ${
                                favorite ? "active" : ""
                              }`}
                              aria-label={
                                favorite ? "إزالة من المفضلة" : "إضافة للمفضلة"
                              }
                              aria-pressed={favorite}
                              onClick={(event) => {
                                event.stopPropagation();

                                toggleFavorite(product.id);
                              }}
                            >
                              <Heart
                                size={19}
                                fill={favorite ? "currentColor" : "none"}
                                aria-hidden="true"
                              />
                            </button>
                          )}

                          <span
                            className={`all-product-condition ${getConditionClass(
                              product,
                            )}`}
                          >
                            {product.condition || "مستخدم"}
                          </span>
                        </div>

                        <div className="all-product-content">
                          <span className="all-product-category">
                            {product.category || "أخرى"}
                          </span>

                          <h3>{product.name || "منتج"}</h3>

                          <div className="all-product-location">
                            <MapPin size={13} aria-hidden="true" />

                            <span>{product.location || "غير محدد"}</span>
                          </div>

                          <div className="all-product-price">
                            <strong>
                              {getProductPrice(product).toLocaleString()}
                            </strong>

                            <span>₪</span>
                          </div>

                          {!owner && (
                            <button
                              type="button"
                              disabled={buttonState.disabled}
                              className={`all-product-cart ${
                                buttonState.type === "in-cart" ? "in-cart" : ""
                              } ${
                                buttonState.type === "my-order"
                                  ? "order-pending"
                                  : ""
                              } ${
                                buttonState.type === "reserved"
                                  ? "order-reserved"
                                  : ""
                              } ${
                                buttonState.type === "sold" ? "order-sold" : ""
                              }`}
                              onClick={(event) =>
                                handleAddToCart(event, product)
                              }
                            >
                              <ButtonIcon size={17} aria-hidden="true" />

                              {buttonState.text}
                            </button>
                          )}

                          {owner && (
                            <div className="all-product-manage">
                              <button
                                type="button"
                                className="all-product-edit"
                                onClick={(event) => {
                                  event.stopPropagation();

                                  navigate(`/edit-product/${product.id}`);
                                }}
                              >
                                تعديل
                              </button>

                              <button
                                type="button"
                                className="all-product-delete"
                                onClick={(event) => {
                                  event.stopPropagation();

                                  openDeleteModal(product);
                                }}
                              >
                                حذف
                              </button>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="no-products">
                  <Search size={35} aria-hidden="true" />

                  <h3>ما لقينا منتجات</h3>

                  <p>جرّب تغيّر البحث أو الفلاتر.</p>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* DELETE MODAL */}

        {productToDelete && (
          <div
            className="delete-modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeDeleteModal();
              }
            }}
          >
            <div
              className="delete-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-product-title"
            >
              <button
                type="button"
                className="delete-modal-close"
                onClick={closeDeleteModal}
                aria-label="إغلاق"
              >
                <X size={18} aria-hidden="true" />
              </button>

              <div className="delete-modal-icon">
                <TriangleAlert size={30} aria-hidden="true" />
              </div>

              <h2 id="delete-product-title">حذف المنتج؟</h2>

              <p>
                هل أنت متأكد من حذف
                <strong> {productToDelete.name || "هذا المنتج"}؟</strong>
                <br />
                لن تتمكن من استرجاعه بعد الحذف.
              </p>

              <div className="delete-modal-actions">
                <button
                  type="button"
                  className="delete-modal-cancel"
                  onClick={closeDeleteModal}
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  className="delete-modal-confirm"
                  onClick={deleteProduct}
                >
                  <Trash2 size={17} aria-hidden="true" />
                  حذف المنتج
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default Products;
