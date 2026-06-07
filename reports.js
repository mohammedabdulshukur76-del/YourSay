document.addEventListener('DOMContentLoaded', () => {
  const barChartWrap = document.querySelector('.bar-chart');

  if (barChartWrap) {
    barChartWrap.innerHTML = '';
    barChartWrap.style.height = '200px'; 
    const canvas1 = document.createElement('canvas');
    canvas1.id = 'monthlyChart';
    barChartWrap.appendChild(canvas1);
    const oldLegend = document.querySelector('.bar-legend');
    if (oldLegend) oldLegend.remove();
    const months  = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const income  = [8.5,   9.2,   11.4,  7.8,   12.3,  16.4];  
    const expense = [6.1,   7.0,   8.5,   9.2,   7.8,   5.4];   
    new Chart(canvas1, {
      type: 'bar',   

      data: {
        labels: months,
        datasets: [
          {
            label: 'Income (₹L)',
            data: income,
            backgroundColor: 'rgba(26, 122, 68, 0.85)',  
            borderRadius: 4,
            borderSkipped: false,
          },
          {
            label: 'Expenses (₹L)',
            data: expense,
            backgroundColor: 'rgba(192, 57, 43, 0.75)',  
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
              callback: (val) => `₹${val}L`  
            }
          }
        },

        animation: {
          duration: 1000,
          easing: 'easeOutQuart',
        }
      }
    });
  }

  const catChartWrap = document.querySelector('.cat-list');

  if (catChartWrap) {
    catChartWrap.innerHTML = '';
    catChartWrap.style.height = '220px';
    catChartWrap.style.position = 'relative';
    const canvas2 = document.createElement('canvas');
    canvas2.id = 'categoryChart';
    catChartWrap.appendChild(canvas2);

    const categories = ['Infrastructure', 'Healthcare', 'Education', 'Disaster Relief', 'Others'];
    const values     = [34, 26, 18, 14, 8];  
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
        cutout: '65%',  

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
          animateRotate: true,   
          duration: 1000,
          easing: 'easeOutQuart',
        }
      }
    });
  }

  const contentArea = document.querySelector('.content');

  if (contentArea) {
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

    const reportsList = document.querySelector('.reports-list-section');
    if (reportsList) {
      contentArea.insertBefore(lineCard, reportsList);
    } else {
      contentArea.appendChild(lineCard);
    }

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
            tension: 0.4,  
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

  document.querySelectorAll('.dl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Downloads available after backend setup.', 'info');
    });
  });


}); 
