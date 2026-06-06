// ============================================================
//  YourSay — reports.js  (runs only on reports.html)
//  Step 6: Real interactive charts using Chart.js
//
//  Chart.js is a free library that draws charts on a <canvas>
//  element. We load it from CDN (no install needed).
//  Add this BEFORE reports.js in your HTML:
//  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
// ============================================================

document.addEventListener('DOMContentLoaded', () => {


  // ── CHART 1: MONTHLY INCOME vs EXPENSES (Bar Chart) ──────────
  // Replaces the static CSS bar chart on reports.html
  // with a real interactive Chart.js bar chart.
  //
  // How it works:
  // 1. Find the old static chart container
  // 2. Clear it and insert a <canvas> element
  // 3. Tell Chart.js to draw on that canvas

  const barChartWrap = document.querySelector('.bar-chart');

  if (barChartWrap) {

    // Clear the old static HTML bars
    barChartWrap.innerHTML = '';
    barChartWrap.style.height = '200px'; // give canvas a proper height

    // Create a canvas element — Chart.js draws on canvas
    const canvas1 = document.createElement('canvas');
    canvas1.id = 'monthlyChart';
    barChartWrap.appendChild(canvas1);

    // Also remove the legend above since Chart.js has its own
    const oldLegend = document.querySelector('.bar-legend');
    if (oldLegend) oldLegend.remove();

    // Data for the chart
    const months  = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const income  = [8.5,   9.2,   11.4,  7.8,   12.3,  16.4];  // in Lakhs
    const expense = [6.1,   7.0,   8.5,   9.2,   7.8,   5.4];   // in Lakhs

    // Create the chart
    new Chart(canvas1, {
      type: 'bar',   // bar chart

      data: {
        labels: months,
        datasets: [
          {
            label: 'Income (₹L)',
            data: income,
            backgroundColor: 'rgba(26, 122, 68, 0.85)',  // green
            borderRadius: 4,
            borderSkipped: false,
          },
          {
            label: 'Expenses (₹L)',
            data: expense,
            backgroundColor: 'rgba(192, 57, 43, 0.75)',  // red
            borderRadius: 4,
            borderSkipped: false,
          }
        ]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: { family: "'Epilogue', sans-serif", size: 12 },
              color: '#3a4039',
              boxWidth: 12,
              boxHeight: 12,
              borderRadius: 3,
            }
          },
          tooltip: {
            callbacks: {
              // Custom tooltip: show "₹8.5L" instead of just "8.5"
              label: (ctx) => ` ₹${ctx.parsed.y}L`
            },
            bodyFont: { family: "'Epilogue', sans-serif" },
            titleFont: { family: "'Epilogue', sans-serif" },
          }
        },

        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: "'Epilogue', sans-serif", size: 11 },
              color: '#8a958a'
            }
          },
          y: {
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              font: { family: "'Epilogue', sans-serif", size: 11 },
              color: '#8a958a',
              callback: (val) => `₹${val}L`  // add ₹ and L to y-axis labels
            }
          }
        },

        // Animation: bars grow up from the bottom
        animation: {
          duration: 1000,
          easing: 'easeOutQuart',
        }
      }
    });
  }


  // ── CHART 2: SPENDING BY CATEGORY (Doughnut Chart) ───────────
  // Replaces the static CSS category bars with a
  // clean doughnut chart that shows proportions visually.

  const catChartWrap = document.querySelector('.cat-list');

  if (catChartWrap) {

    // Clear old CSS bars
    catChartWrap.innerHTML = '';
    catChartWrap.style.height = '220px';
    catChartWrap.style.position = 'relative';

    // Create canvas
    const canvas2 = document.createElement('canvas');
    canvas2.id = 'categoryChart';
    catChartWrap.appendChild(canvas2);

    // Data
    const categories = ['Infrastructure', 'Healthcare', 'Education', 'Disaster Relief', 'Others'];
    const values     = [34, 26, 18, 14, 8];  // percentages
    const colors     = ['#1a7a44', '#c0392b', '#b07d1a', '#1a5fa8', '#8a958a'];

    new Chart(canvas2, {
      type: 'doughnut',

      data: {
        labels: categories,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 8,
        }]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',  // how thick the ring is (higher = thinner)

        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: "'Epilogue', sans-serif", size: 11 },
              color: '#3a4039',
              boxWidth: 10,
              boxHeight: 10,
              padding: 12,
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`
            },
            bodyFont: { family: "'Epilogue', sans-serif" },
          }
        },

        animation: {
          animateRotate: true,   // spins in from 0
          duration: 1000,
          easing: 'easeOutQuart',
        }
      }
    });
  }


  // ── CHART 3: ISSUES RESOLVED OVER TIME (Line Chart) ──────────
  // This is a bonus chart — adds a line chart below the
  // existing two charts showing how many issues were resolved
  // per month. Shows platform growth.

  // Find the content area to append the new chart
  const contentArea = document.querySelector('.content');

  if (contentArea) {

    // Create a new chart card
    const lineCard = document.createElement('div');
    lineCard.className = 'chart-card';
    lineCard.style.cssText = 'margin-bottom:36px;';
    lineCard.innerHTML = `
      <div class="chart-head">
        <div class="chart-title">Issues Resolved per Month</div>
        <span class="chart-period">Jan – Jun 2026</span>
      </div>
      <div style="height:180px;position:relative;">
        <canvas id="resolvedChart"></canvas>
      </div>
    `;

    // Insert before the reports download list
    const reportsList = document.querySelector('.reports-list-section');
    if (reportsList) {
      contentArea.insertBefore(lineCard, reportsList);
    } else {
      contentArea.appendChild(lineCard);
    }

    // Draw the line chart
    const canvas3 = document.getElementById('resolvedChart');
    if (canvas3) {
      new Chart(canvas3, {
        type: 'line',

        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Issues Resolved',
            data: [18, 22, 27, 19, 31, 25],
            borderColor: '#1a7a44',
            backgroundColor: 'rgba(26, 122, 68, 0.08)',
            borderWidth: 2.5,
            pointBackgroundColor: '#1a7a44',
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: true,
            tension: 0.4,  // makes the line curved instead of sharp
          }]
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,

          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.parsed.y} issues resolved`
              },
              bodyFont: { family: "'Epilogue', sans-serif" },
            }
          },

          scales: {
            x: {
              grid: { display: false },
              ticks: {
                font: { family: "'Epilogue', sans-serif", size: 11 },
                color: '#8a958a'
              }
            },
            y: {
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: {
                font: { family: "'Epilogue', sans-serif", size: 11 },
                color: '#8a958a',
                stepSize: 5
              }
            }
          },

          animation: {
            duration: 1200,
            easing: 'easeOutQuart',
          }
        }
      });
    }
  }


  // ── ANIMATE SUMMARY CARDS ────────────────────────────────────
  // Count up the numbers in summary cards at the top
  // Same technique as index.js

  document.querySelectorAll('.sum-val').forEach(el => {
    const original = el.textContent.trim();

    let target = 0;
    let prefix = '';
    let suffix = '';
    let decimal = false;

    if (original.includes('₹') && original.includes('L')) {
      prefix = '₹'; suffix = 'L'; decimal = true;
      target = parseFloat(original.replace('₹','').replace('L',''));
    } else if (original.includes('%')) {
      suffix = '%';
      target = parseInt(original);
    } else {
      target = parseInt(original.replace(/[^0-9]/g,'')) || 0;
    }

    if (!target) return;

    let frame = 0;
    const steps = 50;
    const interval = setInterval(() => {
      frame++;
      const eased   = 1 - Math.pow(1 - frame/steps, 3);
      const current = target * eased;
      el.textContent = prefix + (decimal ? current.toFixed(1) : Math.floor(current)) + suffix;
      if (frame >= steps) {
        clearInterval(interval);
        el.textContent = original;
      }
    }, 20);
  });


  // ── DOWNLOAD BUTTONS ─────────────────────────────────────────
  // Since we don't have real files yet, show a toast
  // explaining they'll be available once backend is ready.

  document.querySelectorAll('.dl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Downloads available after backend setup.', 'info');
    });
  });


}); // end DOMContentLoaded
