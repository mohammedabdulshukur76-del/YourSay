# YourSay — Public Fund Transparency Platform

> **Every rupee. Every decision. In public.**

A citizen-first platform where public funds are tracked transparently, issues are raised by the community, and people vote on what gets fixed first. Built because accountability shouldn't be optional.

🔗 **Live Demo:** [mohammedabdulshukur76-del.github.io/YourSay](https://mohammedabdulshukur76-del.github.io/YourSay/)

---

## What is YourSay?

YourSay is a public fund transparency platform inspired by real frustration — governments and institutions spending public money with zero accountability. YourSay changes that.

Anyone can:
- **Track** every fund transaction in real time
- **Raise issues** that need public funding and attention
- **Vote** on which issues matter most to the community
- **See proof** when work is completed — photos, videos, reviews
- **Collaborate** on innovation projects
- **Get help** through the student community board

---

## Features

### 💰 Fund Transparency
- Complete public transaction ledger — who sent money, where it went, how much is left
- Live balance tracker with visual progress bar
- Filter by type, status, and category
- **Export to CSV** — download any filtered view instantly

### 🗳️ Community Issues
- Citizens raise real problems needing public funds
- Public voting system — highest voted issues get prioritized
- Fund progress bars showing how much has been raised vs the goal
- Proof of completion — verified with images and reviews after work is done
- Persistent votes using localStorage

### 📊 Reports & Analytics
- **Interactive Chart.js charts** — monthly income vs expenses bar chart
- Doughnut chart for spending by category
- Line chart tracking issues resolved per month
- Downloadable quarterly audit reports

### 🎓 Student Community Board
- Students post financial or academic struggles publicly
- Community members reply with support, resources, and offers to help
- Full threaded reply system with localStorage persistence

### 💡 Innovation Showcase
- Anyone can submit a project or idea
- Category filtering (Technology, Environment, Healthcare, Social Impact, Art)
- **Collaboration Wall** — interested people can reach out directly on each project
- Like system to highlight impactful innovations

### ⭐ Public Reviews
- Anyone can review the platform and suggest improvements
- Star rating system (1–5)
- All reviews public and visible to everyone
- Team replies visible on pinned feedback
- Helpful button on each review

---

## Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (custom design system, CSS variables) |
| Interactivity | Vanilla JavaScript (ES6+) |
| Charts | Chart.js |
| Data Persistence | localStorage / sessionStorage |
| Version Control | Git & GitHub |
| Hosting | GitHub Pages |

> **Backend coming soon:** Django + MySQL (Phase 2 in progress)

---

## Pages

| Page | Description |
|---|---|
| `index.html` | Homepage — live balance, recent transactions, top issues |
| `transactions.html` | Full transaction ledger with live search, filters, CSV export |
| `issues.html` | Community issues board — raise, vote, fund, verify |
| `reports.html` | Interactive charts and downloadable audit reports |
| `student-guide.html` | Student resources + Community Help Board |
| `innovation.html` | Innovation showcase with collaboration wall |
| `reviews.html` | Public platform reviews and feedback |

---

## Project Structure

```
YourSay/
├── index.html
├── transactions.html
├── issues.html
├── reports.html
├── student-guide.html
├── innovation.html
├── reviews.html
├── app.js              ← runs on every page (nav, toast, hamburger)
├── index.js            ← homepage counter animations
├── issues.js           ← voting, tab filter, raise issue form
├── transactions.js     ← live search, combo filter, CSV export
├── reviews.js          ← star rating, submit review, helpful button
├── reports.js          ← Chart.js charts replacing static CSS bars
├── student-guide.js    ← FAQ accordion, community help board
└── innovation.js       ← category filter, likes, collaboration wall
```

---

## Run Locally

No installation needed. Just clone and open.

```bash
git clone https://github.com/mohammedabdulshukur76-del/YourSay.git
cd YourSay
```

Open `index.html` in your browser — or use VS Code Live Server for the best experience.

---

## Roadmap

### ✅ Phase 1 — Frontend (Complete)
- 7 fully responsive pages
- Complete JavaScript interactivity
- localStorage data persistence
- Chart.js visualizations
- Mobile-first responsive design

### 🔄 Phase 2 — Backend (In Progress)
- Django REST API
- MySQL database for real data persistence
- User authentication and roles
- Admin panel for approving issues and logging transactions
- Real-time data instead of static placeholders

### 🔮 Phase 3 — Full Launch
- Deployed on cloud (AWS / Railway)
- Real payment/donation integration
- Email notifications for issue status updates
- Telugu and Hindi language support

---

## Why I Built This

I watched an animated short about the Hiroshima bombing and it made me furious — powerful people making decisions that destroy ordinary people's lives, with no accountability.

I looked around and saw the same pattern everywhere. Governments spending public money in black boxes. Exam papers getting leaked. Politicians untouched while citizens suffer.

YourSay is my answer to that. A platform where nothing is hidden. Where every rupee is public. Where your vote actually changes what gets funded.

It's not finished. But it's real, it works, and it's growing.

---

## Contact

**Mohammed Abdul Shukur**
📧 mohammedabdulshukur76@gmail.com
📞 +91 9121044576
🔗 [LinkedIn](https://www.linkedin.com/in/mohammed-abdul-shukur)
🐙 [GitHub](https://github.com/mohammedabdulshukur76-del)
📍 Hyderabad, Telangana, India

---

*Built with purpose. More coming soon.*
