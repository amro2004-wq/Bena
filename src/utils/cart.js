/* CART STORAGE */

export const getCart = (userId) => {
  if (!userId) {
    return [];
  }

  const savedCart = JSON.parse(localStorage.getItem("benaCart")) || {};

  const cartObject = Array.isArray(savedCart) ? {} : savedCart;

  return cartObject[String(userId)] || [];
};

/* SAVE CART */

export const saveCart = (userId, cart) => {
  if (!userId) {
    return;
  }

  const savedCart = JSON.parse(localStorage.getItem("benaCart")) || {};

  const cartObject = Array.isArray(savedCart) ? {} : savedCart;

  const updatedCart = {
    ...cartObject,
    [String(userId)]: cart,
  };

  localStorage.setItem("benaCart", JSON.stringify(updatedCart));

  window.dispatchEvent(
    new CustomEvent("bena-cart-updated", {
      detail: {
        userId: String(userId),
        cart,
      },
    }),
  );
};

/* ADD PRODUCT */

export const addToCart = (userId, productId) => {
  const cart = getCart(userId);

  const exists = cart.some((id) => Number(id) === Number(productId));

  if (exists) {
    return {
      added: false,
      cart,
    };
  }

  const updatedCart = [...cart, productId];

  saveCart(userId, updatedCart);

  return {
    added: true,
    cart: updatedCart,
  };
};

/* REMOVE PRODUCT */

export const removeFromCart = (userId, productId) => {
  const cart = getCart(userId);

  const updatedCart = cart.filter((id) => Number(id) !== Number(productId));

  saveCart(userId, updatedCart);

  return updatedCart;
};

/* CART ANIMATION */

export const animateProductToCart = (imageElement) => {
  const cartTarget = document.getElementById("bena-cart-target");

  if (!imageElement || !cartTarget) {
    return;
  }

  const imageRect = imageElement.getBoundingClientRect();

  const cartRect = cartTarget.getBoundingClientRect();

  const flyingImage = imageElement.cloneNode(true);

  flyingImage.className = "bena-flying-product";

  const startSize = Math.min(imageRect.width, 110);

  Object.assign(flyingImage.style, {
    position: "fixed",

    top: `${imageRect.top}px`,
    left: `${imageRect.left}px`,

    width: `${startSize}px`,
    height: `${startSize}px`,

    objectFit: "cover",

    borderRadius: "16px",

    pointerEvents: "none",

    zIndex: "99999",

    margin: "0",

    opacity: "1",

    transform: "scale(1) rotate(0deg)",

    boxShadow: "0 15px 35px rgba(91, 33, 182, 0.3)",

    transition:
      "top 0.75s cubic-bezier(0.22, 1, 0.36, 1), left 0.75s cubic-bezier(0.22, 1, 0.36, 1), width 0.75s ease, height 0.75s ease, opacity 0.75s ease, transform 0.75s ease",
  });

  document.body.appendChild(flyingImage);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      flyingImage.style.left = `${cartRect.left + cartRect.width / 2 - 18}px`;

      flyingImage.style.top = `${cartRect.top + cartRect.height / 2 - 18}px`;

      flyingImage.style.width = "44px";
      flyingImage.style.height = "44px";

      flyingImage.style.opacity = "0.35";

      flyingImage.style.transform = "scale(0.6) rotate(6deg)";
    });
  });

  setTimeout(() => {
    flyingImage.remove();

    cartTarget.classList.add("bena-cart-bounce");

    setTimeout(() => {
      cartTarget.classList.remove("bena-cart-bounce");
    }, 420);
  }, 850);
};
