const REV_API = 'https://yoursay-backend-g6ri.onrender.com/api/reviews/';

document.addEventListener("DOMContentLoaded", () => {
  let userRating = 0;
  function loadReviews() {
    fetch(REV_API)
      .then((res) => res.json())
      .then((data) => {
        const feed = document.querySelector(".feed-head").parentElement;

        feed
          .querySelectorAll(".review-card, .pinned-card")
          .forEach((el) => el.remove());

        data.reviews.forEach((r) => renderReviewCard(r, feed));
        updateRatingBar(data.reviews);
        updateTopReviewers(data.reviews);
      })
      .catch(() => {
        showToast("Could not load reviews.", "error");
      });
  }

  function renderReviewCard(r, feed) {
    const stars = "⭐".repeat(r.rating);
    const pillMap = {
      ui: { cls: "cat-ui", label: "UI / Design" },
      feature: { cls: "cat-feature", label: "Feature Request" },
      bug: { cls: "cat-bug", label: "Bug Report" },
      content: { cls: "cat-content", label: "Content" },
      general: { cls: "cat-general", label: "General" },
    };
    const pill = pillMap[r.type] || pillMap.general;

    const avatarColors = [
      "#1a7a44",
      "#1a5fa8",
      "#c0392b",
      "#6b3fa0",
      "#b07d1a",
      "#111612",
    ];
    const color = avatarColors[r.name.charCodeAt(0) % avatarColors.length];
    const parts = r.name.toUpperCase().split(" ");
    const initials =
      parts.length >= 2
        ? parts[0][0] + parts[parts.length - 1][0]
        : parts[0].substring(0, 2);

    const alreadyHelped =
      sessionStorage.getItem(`yl_helped_${r.id}`) === "true";

    const card = document.createElement("div");
    card.className = r.is_pinned ? "pinned-card" : "review-card";
    card.dataset.id = r.id;
    if (r.is_pinned) {
      card.innerHTML += `<span class="pin-badge">📌 Pinned</span>`;
    }
    card.innerHTML += `
      <div class="rc-top">
        <div class="rc-user">
          <div class="avatar" style="background:${color};width:38px;height:38px;
            border-radius:50%;display:flex;align-items:center;justify-content:center;
            color:#fff;font-size:.85rem;font-weight:700;flex-shrink:0;">
            ${initials}
          </div>
          <div>
            <div class="user-name">${r.name}</div>
            <div class="user-meta">
              ${r.location ? "📍 " + r.location + " · " : ""}${r.created_at}
            </div>
          </div>
        </div>
        <div class="rc-right">
          <div class="stars">${stars}</div>
          <span class="rc-cat ${pill.cls}">${pill.label}</span>
        </div>
      </div>
      <div class="review-text">${r.text}</div>
      ${
        r.team_reply
          ? `
        <div class="team-reply">
          <div class="reply-head">✅ YourSay Team replied</div>
          <div class="reply-text">${r.team_reply}</div>
        </div>`
          : ""
      }
      <div class="rc-footer">
        <button class="helpful-btn" data-id="${r.id}"
          data-count="${r.helpful}"
          ${alreadyHelped ? 'disabled style="opacity:.6"' : ""}>
          👍 Helpful (${r.helpful})
        </button>
        <span class="rc-date">${r.created_at}</span>
      </div>
    `;

    const feedHead = feed.querySelector(".feed-head");
    if (r.is_pinned) {
      feedHead
        ? feedHead.insertAdjacentElement("afterend", card)
        : feed.insertBefore(card, feed.firstChild);
    } else {
      feed.appendChild(card);
    }

    const helpBtn = card.querySelector(".helpful-btn");
    if (helpBtn && !alreadyHelped) {
      helpBtn.addEventListener("click", () => markHelpful(r.id, helpBtn));
    }
  }

  function markHelpful(reviewId, btn) {
    fetch(`${REV_API}${reviewId}/helpful/`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          btn.textContent = `👍 Helpful (${data.helpful})`;
          btn.disabled = true;
          btn.style.color = "var(--green)";
          btn.style.borderColor = "var(--green-mid)";
          sessionStorage.setItem(`yl_helped_${reviewId}`, "true");
          showToast("Marked as helpful!", "success");
        }
      })
      .catch(() => showToast("Could not save. Try again.", "error"));
  }

  function updateRatingBar(reviews) {
    if (!reviews.length) return;

    const total = reviews.length;
    const avg = (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1);

    const scoreBig = document.querySelector(".score-big");
    if (scoreBig) scoreBig.textContent = avg;

    const scoreCount = document.querySelector(".score-count");
    if (scoreCount) scoreCount.textContent = `Based on ${total} reviews`;

    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => counts[r.rating]++);

    document.querySelectorAll(".rb-row").forEach((row) => {
      const label = row.querySelector(".rb-label");
      const bar = row.querySelector(".rb-bar");
      const count = row.querySelector(".rb-count");
      if (!label) return;

      const star = parseInt(label.textContent);
      const pct = total > 0 ? (counts[star] / total) * 100 : 0;
      if (bar) bar.style.width = pct + "%";
      if (count) count.textContent = counts[star];
    });

    const statVals = document.querySelectorAll(".hs-val");
    if (statVals[0]) statVals[0].textContent = avg;
    if (statVals[1]) statVals[1].textContent = total;
    const posPct =
      total > 0
        ? Math.round(
            (reviews.filter((r) => r.rating >= 4).length / total) * 100,
          )
        : 0;
    if (statVals[2]) statVals[2].textContent = posPct + "%";
  }

  // ── UPDATE TOP REVIEWERS ──────────────────────────────────────
function updateTopReviewers(reviews) {
  // Group reviews by name and sum up counts
  const reviewerMap = {};

  reviews.forEach(r => {
    if (!reviewerMap[r.name]) {
      reviewerMap[r.name] = { name: r.name, count: 0, helpful: 0 };
    }
    reviewerMap[r.name].count  += 1;
    reviewerMap[r.name].helpful += r.helpful;
  });

  // Sort by helpful first, then by review count
  const sorted = Object.values(reviewerMap)
    .sort((a, b) => b.helpful - a.helpful || b.count - a.count)
    .slice(0, 3);

  const badges = [
    { cls:'badge-gold',   label:'🥇 Gold'   },
    { cls:'badge-silver', label:'🥈 Silver' },
    { cls:'badge-bronze', label:'🥉 Bronze' },
  ];

  const avatarColors = [
    '#1a7a44','#1a5fa8','#c0392b',
    '#6b3fa0','#b07d1a','#111612'
  ];

  // Find the container that holds the rows
  const contribCard = document.querySelector('.contrib-card');
  if (!contribCard) return;

  // Remove old rows but keep the header
  contribCard.querySelectorAll('.contrib-row').forEach(r => r.remove());

  // Build new rows from real data
  sorted.forEach((reviewer, i) => {
    const color    = avatarColors[reviewer.name.charCodeAt(0) % avatarColors.length];
    const parts    = reviewer.name.toUpperCase().split(' ');
    const initials = parts.length >= 2
      ? parts[0][0] + parts[parts.length-1][0]
      : parts[0].substring(0, 2);

    const badge = badges[i];

    const row = document.createElement('div');
    row.className = 'contrib-row';
    row.innerHTML = `
      <div class="contrib-left">
        <span class="contrib-rank">${i + 1}</span>
        <div style="width:30px;height:30px;border-radius:50%;
          background:${color};display:flex;align-items:center;
          justify-content:center;color:#fff;font-size:.7rem;
          font-weight:700;flex-shrink:0;">
          ${initials}
        </div>
        <div>
          <div class="contrib-name">${reviewer.name}</div>
          <div class="contrib-count">
            ${reviewer.count} ${reviewer.count === 1 ? 'review' : 'reviews'}
            · ${reviewer.helpful} helpful
          </div>
        </div>
      </div>
      <span class="contrib-badge ${badge.cls}">${badge.label}</span>
    `;
    contribCard.appendChild(row);
  });

  // If no reviewers yet
  if (sorted.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'padding:16px 20px;font-size:.82rem;color:var(--muted);';
    empty.textContent   = 'No reviews yet. Be the first!';
    contribCard.appendChild(empty);
  }
}

  const stars = document.querySelectorAll(".star-pick");
  const starPicker = document.querySelector(".star-picker");

  stars.forEach((star, index) => {
    star.removeAttribute("onclick");

    star.addEventListener("mouseenter", () => {
      stars.forEach((s, i) => {
        s.style.filter = i <= index ? "none" : "grayscale(1)";
        s.style.opacity = i <= index ? "1" : "0.3";
      });
    });

    star.addEventListener("click", () => {
      userRating = index + 1;
      updateStars(userRating);
      showToast(
        `${userRating} star${userRating > 1 ? "s" : ""} selected`,
        "info",
      );
    });
  });

  if (starPicker) {
    starPicker.addEventListener("mouseleave", () => updateStars(userRating));
  }

  function updateStars(rating) {
    stars.forEach((s, i) => {
      s.style.filter = i < rating ? "none" : "grayscale(1)";
      s.style.opacity = i < rating ? "1" : "0.3";
    });
  }

  const submitBtn = document.querySelector(".form-body .submit-btn");
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      const nameInput = document.querySelector(
        '.form-body input[placeholder*="appear"]',
      );
      const locInput = document.querySelector(
        '.form-body input[placeholder*="City"]',
      );
      const typeSelect = document.querySelector(".form-body select");
      const textArea = document.querySelector(".form-body textarea");

      const name = nameInput ? nameInput.value.trim() : "";
      const loc = locInput ? locInput.value.trim() : "";
      const type = typeSelect ? typeSelect.value : "general";
      const text = textArea ? textArea.value.trim() : "";

      if (!name) {
        showToast("Please enter your name.", "error");
        return;
      }
      if (userRating === 0) {
        showToast("Please select a star rating.", "error");
        return;
      }
      if (text.length < 20) {
        showToast("Please write at least 20 characters.", "error");
        return;
      }
      if (!type || type === "Select type") {
        showToast("Please select a feedback type.", "error");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      fetch(`${REV_API}submit/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          location: loc,
          type,
          rating: userRating,
          text,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            // Clear form
            if (nameInput) nameInput.value = "";
            if (locInput) locInput.value = "";
            if (typeSelect) typeSelect.value = "Select type";
            if (textArea) textArea.value = "";
            userRating = 0;
            updateStars(0);

            showToast("Review posted! Thank you ✓", "success");
            loadReviews(); // reload to show new review
          }
        })
        .catch(() => showToast("Submission failed. Try again.", "error"))
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit Review";
        });
    });
  }

  document.querySelectorAll(".ftab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".ftab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const keyword = tab.textContent.trim().toLowerCase();

      document
        .querySelectorAll(".review-card, .pinned-card")
        .forEach((card) => {
          if (keyword === "all") {
            card.style.display = "";
            return;
          }
          const typeBadge = card.querySelector(".rc-cat");
          if (!typeBadge) return;
          card.style.display = typeBadge.textContent
            .toLowerCase()
            .includes(keyword)
            ? ""
            : "none";
        });
    });
  });

  loadReviews();
});
