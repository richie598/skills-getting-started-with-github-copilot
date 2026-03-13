document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const themeToggle = document.getElementById("theme-toggle");

  const THEME_STORAGE_KEY = "mhs-theme";

  let messageTimeoutId;

  function applyTheme(theme) {
    const isDark = theme === "dark";
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");

    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
      );

      const icon = themeToggle.querySelector(".theme-icon");
      if (icon) {
        icon.textContent = isDark ? "☀" : "🌙";
      }

      const label = themeToggle.querySelector(".theme-label");
      if (label) {
        label.textContent = isDark ? "Light mode" : "Dark mode";
      }
    }
  }

  function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const nextTheme = currentTheme === "dark" ? "light" : "dark";

        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        applyTheme(nextTheme);
      });
    }
  }

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    if (messageTimeoutId) {
      clearTimeout(messageTimeoutId);
    }

    messageTimeoutId = setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <p><strong>Participants:</strong></p>
          ${details.participants.length > 0 ? `<ul>${details.participants.map(email => `<li>${email} <button class="delete-btn" data-email="${email}" data-activity="${name}" aria-label="Remove ${email} from ${name}">×</button></li>`).join('')}</ul>` : '<p>No participants yet.</p>'}
        `;

        activitiesList.appendChild(activityCard);

        // Add event listeners for delete buttons
        activityCard.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const email = e.target.dataset.email;
            const activity = e.target.dataset.activity;
            try {
              const response = await fetch(`/activities/${encodeURIComponent(activity)}/participants/${encodeURIComponent(email)}`, {
                method: 'DELETE'
              });
              if (response.ok) {
                // Refresh the activities list
                fetchActivities();
                showMessage(`Removed ${email} from ${activity}`, "success");
              } else {
                const result = await response.json();
                const errorMessage = result.detail || "Failed to remove participant";
                showMessage(errorMessage, "error");
              }
            } catch (error) {
              showMessage("Failed to remove participant. Please try again.", "error");
              console.error("Error removing:", error);
            }
          });
        });

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        signupForm.reset();
        // Refresh the activities list to show updated participants
        fetchActivities();
      } else {
        const errorMessage = result.detail || "An error occurred";
        showMessage(errorMessage, "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  initializeTheme();
  fetchActivities();
});
