(function () {
  "use strict";

  (function injectCriticalStyle() {
    if (document.getElementById("mc-critical-style")) return;
    const style = document.createElement("style");
    style.id = "mc-critical-style";
    style.textContent = `
            html, body {
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden !important;
                min-height: 100vh !important;
                height: 100% !important;
                background: radial-gradient(circle at 70% 20%, #010088 0%, #1C1C1C 60%, #0a0a0a 100%) !important;
            }
            .navbar, .navbar-home, header,
            .page-card, .login-card, .page-card-head,
            .page-content, .login-content, .for-login,
            .form-signin, .page-container, .web-footer {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
            }
            .custom-login-wrapper {
                display: flex !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
        `;
    document.head.insertBefore(style, document.head.firstChild);
  })();

  function hideDefaultLogin() {
    const selectors = [
      ".page-card",
      ".login-card",
      ".page-card-head",
      ".page-content",
      ".login-content",
      ".for-login",
      ".form-signin",
      ".page-container",
      ".web-footer",
      ".navbar",
      ".navbar-home",
      "header",
    ];
    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (!el.closest(".custom-login-wrapper")) {
          el.style.setProperty("display", "none", "important");
          el.style.setProperty("visibility", "hidden", "important");
          el.style.setProperty("opacity", "0", "important");
        }
      });
    });
  }

  function showView(view) {
    const loginView = document.getElementById("view-login");
    const forgotView = document.getElementById("view-forgot");
    if (!loginView || !forgotView) return;

    if (view === "forgot") {
      loginView.style.display = "none";
      forgotView.style.display = "";
      resetForgotView();
    } else {
      forgotView.style.display = "none";
      loginView.style.display = "";
    }
  }

  function resetForgotView() {
    const emailInput = document.getElementById("forgot-email");
    const errorMsg = document.getElementById("forgot-error-msg");
    const successBox = document.getElementById("forgot-success");
    const formFields = document.getElementById("forgot-form-fields");
    const btn = document.getElementById("forgot-btn");

    if (emailInput) emailInput.value = "";
    if (errorMsg) {
      errorMsg.textContent = "";
      errorMsg.style.display = "none";
    }
    if (successBox) successBox.style.display = "none";
    if (formFields) formFields.style.display = "";
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Send Reset Email";
    }
  }

  function initPasswordToggle() {
    const toggle = document.querySelector(".custom-password-toggle");
    const pwdInput = document.getElementById("login-pwd");
    if (!toggle || !pwdInput) return;

    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      const eyeOpen = toggle.querySelector(".eye-open");
      const eyeClosed = toggle.querySelector(".eye-closed");
      if (pwdInput.type === "password") {
        pwdInput.type = "text";
        if (eyeOpen) eyeOpen.style.display = "none";
        if (eyeClosed) eyeClosed.style.display = "block";
      } else {
        pwdInput.type = "password";
        if (eyeOpen) eyeOpen.style.display = "block";
        if (eyeClosed) eyeClosed.style.display = "none";
      }
    });
  }

  function initRememberMe() {
    const checkbox = document.getElementById("custom-remember");
    const usrInput = document.getElementById("login-usr");
    if (!checkbox) return;

    const remembered = localStorage.getItem("rememberMe") === "true";
    checkbox.checked = remembered;
    if (remembered && usrInput) {
      usrInput.value = localStorage.getItem("rememberedUsr") || "";
    }

    checkbox.addEventListener("change", function () {
      localStorage.setItem("rememberMe", this.checked);
      if (!this.checked) {
        localStorage.removeItem("rememberedUsr");
      }
    });
  }

  function initViewSwitching() {
    const gotoForgot = document.getElementById("goto-forgot");
    const gotoLogin = document.getElementById("goto-login");

    if (gotoForgot) {
      gotoForgot.addEventListener("click", function (e) {
        e.preventDefault();
        showView("forgot");
      });
    }

    if (gotoLogin) {
      gotoLogin.addEventListener("click", function (e) {
        e.preventDefault();
        showView("login");
      });
    }
  }

  function initForgotSubmit() {
    const btn = document.getElementById("forgot-btn");
    if (!btn) return;

    btn.addEventListener("click", doForgot);

    const emailInput = document.getElementById("forgot-email");
    if (emailInput) {
      emailInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") doForgot();
      });
    }
  }

  function doForgot() {
    const btn = document.getElementById("forgot-btn");
    const emailInput = document.getElementById("forgot-email");
    const errorMsg = document.getElementById("forgot-error-msg");
    const successBox = document.getElementById("forgot-success");
    const formFields = document.getElementById("forgot-form-fields");

    const email = emailInput ? emailInput.value.trim() : "";

    if (!email) {
      showForgotError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showForgotError("Please enter a valid email address.");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Sending...";
    if (errorMsg) {
      errorMsg.textContent = "";
      errorMsg.style.display = "none";
    }

    fetch("/api/method/frappe.core.doctype.user.user.reset_password", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Frappe-CSRF-Token": frappe_csrf_token(),
      },
      body: "user=" + encodeURIComponent(email),
    })
      .then(function (res) {
        if (res.status === 404) {
          throw new Error("not_found");
        }
        return res.json().catch(function () {
          return {};
        });
      })
      .then(function () {
        if (formFields) formFields.style.display = "none";
        if (successBox) successBox.style.display = "";
      })
      .catch(function (err) {
        if (err.message === "not_found") {
          showForgotError("No account found with this email.");
        } else {
          showForgotError("Something went wrong. Please try again.");
        }
        btn.disabled = false;
        btn.textContent = "Send Reset Email";
      });
  }

  function showForgotError(msg) {
    const errorMsg = document.getElementById("forgot-error-msg");
    if (errorMsg) {
      errorMsg.textContent = msg;
      errorMsg.style.display = "";
    }
  }

  function frappe_csrf_token() {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : "fetch";
  }

  function initFormSubmit() {
    const btn = document.getElementById("login-btn");
    if (!btn) return;

    btn.addEventListener("click", doLogin);

    ["login-usr", "login-pwd"].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("keydown", function (e) {
          if (e.key === "Enter") doLogin();
        });
      }
    });
  }

  function getRedirectUrl() {
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get("redirect-to") || params.get("redirect_to");
    if (redirectTo && redirectTo.startsWith("/")) return redirectTo;
    return "/app/home";
  }

  function doLogin() {
    const btn = document.getElementById("login-btn");
    const usrInput = document.getElementById("login-usr");
    const pwdInput = document.getElementById("login-pwd");
    const checkbox = document.getElementById("custom-remember");

    const usr = usrInput.value.trim();
    const pwd = pwdInput.value;

    if (!usr || !pwd) {
      showLoginError("Please enter username and password.");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Logging in...";

    const existingErr = document.getElementById("login-error-msg");
    if (existingErr) existingErr.textContent = "";

    const formData = new FormData();
    formData.append("cmd", "login");
    formData.append("usr", usr);
    formData.append("pwd", pwd);
    formData.append("device", "desktop");

    fetch("/", {
      method: "POST",
      credentials: "same-origin",
      body: formData,
    })
      .then(function (res) {
        if (res.status === 401) throw new Error("invalid_credentials");
        return res.json().catch(function () {
          return { message: "Logged In" };
        });
      })
      .then(function (data) {
        if (
          data.message === "Logged In" ||
          data.message === "No App" ||
          data.home_page
        ) {
          if (checkbox && checkbox.checked) {
            localStorage.setItem("rememberedUsr", usr);
          } else {
            localStorage.removeItem("rememberedUsr");
          }
          const destination = data.home_page || getRedirectUrl();
          setTimeout(function () {
            window.location.href = destination;
          }, 200);
        } else {
          showLoginError("Invalid username or password.");
          btn.disabled = false;
          btn.textContent = "Login";
        }
      })
      .catch(function (err) {
        if (err.message === "invalid_credentials") {
          showLoginError("Invalid username or password.");
        } else {
          showLoginError("Something went wrong. Please try again.");
        }
        btn.disabled = false;
        btn.textContent = "Login";
      });
  }

  function showLoginError(msg) {
    let err = document.getElementById("login-error-msg");
    if (!err) {
      err = document.createElement("p");
      err.id = "login-error-msg";
      err.style.cssText =
        "color:#ff6b6b;font-size:clamp(12px,0.8vw,13px);margin:0 0 1.5vh 0;";
      const formContent = document.querySelector(
        "#view-login .custom-form-content",
      );
      if (formContent) formContent.insertBefore(err, formContent.firstChild);
    }
    err.textContent = msg;
  }

  function boot() {
    hideDefaultLogin();
    initPasswordToggle();
    initRememberMe();
    initViewSwitching();
    initForgotSubmit();
    initFormSubmit();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  const observer = new MutationObserver(function () {
    hideDefaultLogin();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class", "data-route"],
  });

  let lastRoute = document.body.getAttribute("data-route");
  setInterval(function () {
    const current = document.body.getAttribute("data-route");
    if (current !== lastRoute) {
      lastRoute = current;
      if (current === "login") hideDefaultLogin();
    }
  }, 50);
})();
