document.addEventListener('DOMContentLoaded', () => {
    const weightInput = document.getElementById('weight');
    const repsInput = document.getElementById('reps');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultsSection = document.getElementById('results');

    // Result elements
    const average1rmEl = document.getElementById('average-1rm');
    const epley1rmEl = document.getElementById('epley-1rm');
    const brzycki1rmEl = document.getElementById('brzycki-1rm');
    const oconner1rmEl = document.getElementById('oconner-1rm');

    // Target elements
    const target3rm = document.getElementById('target-3rm');
    const target5rm = document.getElementById('target-5rm');
    const target8rm = document.getElementById('target-8rm');
    const target10rm = document.getElementById('target-10rm');

    // Record elements
    const recordSection = document.getElementById('records-section');
    const recordExerciseName = document.getElementById('record-exercise-name');
    const recordMaxWeight = document.getElementById('record-max-weight');
    const recordMaxWeightDate = document.getElementById('record-max-weight-date');
    const recordMax1rm = document.getElementById('record-max-1rm');
    const recordMax1rmDate = document.getElementById('record-max-1rm-date');

    // Exercise selector
    const exerciseRadios = document.querySelectorAll('input[name="exercise"]');

    // Theme colors for exercises
    const colors = {
        benchpress: { gradient: 'linear-gradient(135deg, #e5e5e5, #a3a3a3)', glow: 'rgba(255, 255, 255, 0.15)', text: '#000000' },
        deadlift: { gradient: 'linear-gradient(135deg, #d4af37, #8a7322)', glow: 'rgba(212, 175, 55, 0.15)', text: '#000000' },
        squat: { gradient: 'linear-gradient(135deg, #6b7280, #374151)', glow: 'rgba(107, 114, 128, 0.15)', text: '#ffffff' }
    };

    // Change theme based on selected exercise
    function updateTheme(exercise) {
        const theme = colors[exercise];
        document.documentElement.style.setProperty('--accent-gradient', theme.gradient);
        document.documentElement.style.setProperty('--accent-glow', theme.glow);
        document.documentElement.style.setProperty('--accent-text', theme.text);
    }

    exerciseRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            updateTheme(e.target.value);
            if (typeof updateMaxRecords === 'function') {
                updateMaxRecords(e.target.value);
            }
            // Hide results when changing exercise to force recalculation
            if (!resultsSection.classList.contains('hidden')) {
                resultsSection.classList.add('hidden');
            }
        });
    });

    // Formula calculation functions
    function calculateEpley(weight, reps) {
        if (reps === 1) return weight;
        return weight * (1 + reps / 30);
    }

    function calculateBrzycki(weight, reps) {
        if (reps === 1) return weight;
        return weight * (36 / (37 - reps));
    }

    function calculateOconner(weight, reps) {
        if (reps === 1) return weight;
        return weight * (1 + 0.025 * reps);
    }

    function updateResults() {
        const weight = parseFloat(weightInput.value);
        const reps = parseInt(repsInput.value, 10);

        if (isNaN(weight) || isNaN(reps) || weight <= 0 || reps <= 0) {
            // Remove animation class briefly to replay it
            calculateBtn.style.transform = 'scale(0.95)';
            setTimeout(() => calculateBtn.style.transform = '', 150);
            return;
        }

        const epley = calculateEpley(weight, reps);
        const brzycki = calculateBrzycki(weight, reps);
        const oconner = calculateOconner(weight, reps);
        const average = (epley + brzycki + oconner) / 3;

        // Animate values counting up
        animateValue(average1rmEl, average, ' kg', 1000);

        epley1rmEl.textContent = `${epley.toFixed(1)} kg`;
        brzycki1rmEl.textContent = `${brzycki.toFixed(1)} kg`;
        oconner1rmEl.textContent = `${oconner.toFixed(1)} kg`;

        // Update targets based on average
        target3rm.textContent = `${(average * 0.90).toFixed(1)} kg`;
        target5rm.textContent = `${(average * 0.87).toFixed(1)} kg`;
        target8rm.textContent = `${(average * 0.80).toFixed(1)} kg`;
        target10rm.textContent = `${(average * 0.75).toFixed(1)} kg`;

        // Show results if hidden
        if (resultsSection.classList.contains('hidden')) {
            resultsSection.classList.remove('hidden');
            setTimeout(() => {
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    }

    function animateValue(element, end, suffix, duration = 1000) {
        let startTimestamp = null;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            // easeOutQuart
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            const currentValue = easeProgress * end;

            element.textContent = `${currentValue.toFixed(1)}${suffix}`;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = `${end.toFixed(1)}${suffix}`;
            }
        };

        window.requestAnimationFrame(step);
    }

    calculateBtn.addEventListener('click', updateResults);

    // Add enter key support
    repsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            updateResults();
        }
    });
    weightInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            updateResults();
        }
    });

    // --- Tab Switching Logic ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --- Workout Menu Logic ---
    const workoutDateInput = document.getElementById('workout-date');
    const menuListTitle = document.getElementById('menu-list-title');
    const categoryFilter = document.getElementById('category-filter');
    const menuExerciseSelect = document.getElementById('menu-exercise');
    const customExerciseContainer = document.getElementById('custom-exercise-container');
    const customExerciseInput = document.getElementById('custom-exercise');
    const addMenuBtn = document.getElementById('add-menu-btn');
    const workoutMenuList = document.getElementById('workout-menu-list');
    const totalVolumeDisplay = document.getElementById('total-volume-value');
    const workoutTimerValue = document.getElementById('workout-timer-value');
    const saveMenuBtn = document.getElementById('save-menu-btn');
    const clearMenuBtn = document.getElementById('clear-menu-btn');

    let workoutTimerInterval = null;

    // Copy Feature Elements
    const copyDateSelect = document.getElementById('copy-date-select');
    const copyMenuBtn = document.getElementById('copy-menu-btn');

    // Wizard Flow Elements
    const wizardStep1 = document.getElementById('wizard-step-1');
    const wizardStep2 = document.getElementById('wizard-step-2');
    const wizardStep3 = document.getElementById('wizard-step-3');

    const step1NextBtn = document.getElementById('step1-next-btn');
    const step2NewBtn = document.getElementById('step2-new-btn');
    const step2BackBtn = document.getElementById('step2-back-btn');
    const step3BackBtn = document.getElementById('step3-back-btn');

    // Custom Modal Elements
    const customAlertModal = document.getElementById('custom-alert-modal');
    const modalUncompletedList = document.getElementById('modal-uncompleted-list');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // Review Tab Elements
    const reviewDateSelect = document.getElementById('review-date-select');
    const reviewDateTitle = document.getElementById('review-date-title');
    const reviewTotalVolume = document.getElementById('review-total-volume');
    const reviewDuration = document.getElementById('review-duration');
    const reviewWorkoutList = document.getElementById('review-workout-list');
    const reviewDetails = document.getElementById('review-details');
    const reviewEmptyMessage = document.getElementById('review-empty-message');

    // Initialize Date Input with Today's Date
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    workoutDateInput.value = todayStr;

    // Load entire history from localStorage
    let workoutHistory = JSON.parse(localStorage.getItem('workoutHistory')) || {};
    let workoutMetadata = JSON.parse(localStorage.getItem('workoutMetadata')) || {};

    // Legacy migration
    const oldMenu = localStorage.getItem('workoutMenu');
    if (oldMenu && !workoutHistory[todayStr]) {
        const parsedOld = JSON.parse(oldMenu);
        workoutHistory[todayStr] = parsedOld.map(item => {
            if (item.sets && Array.isArray(item.sets)) return item;
            let newSets = [];
            for (let i = 0; i < (item.sets || 1); i++) {
                newSets.push({ weight: item.weight || 0, reps: item.reps || 0, completed: false });
            }
            return { exercise: item.exercise, sets: newSets };
        });
        localStorage.removeItem('workoutMenu');
        saveHistory();
    } else {
        let migrated = false;
        for (const date in workoutHistory) {
            workoutHistory[date] = workoutHistory[date].map(item => {
                if (item.sets && Array.isArray(item.sets)) return item;
                migrated = true;
                let newSets = [];
                for (let i = 0; i < (item.sets || 1); i++) {
                    newSets.push({ weight: item.weight || 0, reps: item.reps || 0, completed: false });
                }
                return { exercise: item.exercise, sets: newSets };
            });
        }
        if (migrated) saveHistory();
    }

    function getCurrentDate() {
        return workoutDateInput.value || todayStr;
    }

    function getDailyMenu() {
        const date = getCurrentDate();
        return workoutHistory[date] || [];
    }

    function saveHistory() {
        localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
        updateReviewDateOptions();

        if (reviewDateSelect && reviewDateSelect.value === getCurrentDate()) {
            renderReviewTab();
        }
    }

    function saveMetadata() {
        localStorage.setItem('workoutMetadata', JSON.stringify(workoutMetadata));
    }

    // --- Timer Logic ---
    function formatTime(ms) {
        let totalSeconds = Math.floor(ms / 1000);
        let hours = Math.floor(totalSeconds / 3600);
        let minutes = Math.floor((totalSeconds % 3600) / 60);
        let seconds = totalSeconds % 60;
        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
    }

    function updateTimerDisplay() {
        if (!workoutTimerValue) return;
        const date = getCurrentDate();
        const meta = workoutMetadata[date] || {};

        if (meta.endTime && meta.startTime) {
            const duration = meta.endTime - meta.startTime;
            workoutTimerValue.textContent = formatTime(duration);
            if (workoutTimerInterval) {
                clearInterval(workoutTimerInterval);
                workoutTimerInterval = null;
            }
        } else if (meta.startTime) {
            const duration = Date.now() - meta.startTime;
            workoutTimerValue.textContent = formatTime(duration);
        } else {
            workoutTimerValue.textContent = "00:00:00";
            if (workoutTimerInterval) {
                clearInterval(workoutTimerInterval);
                workoutTimerInterval = null;
            }
        }
    }

    function startTimerIfNeeded() {
        const date = getCurrentDate();
        if (!workoutMetadata[date]) {
            workoutMetadata[date] = {};
        }

        const meta = workoutMetadata[date];
        if (!meta.startTime && !meta.endTime) {
            meta.startTime = Date.now();
            saveMetadata();
        }

        if (meta.startTime && !meta.endTime && !workoutTimerInterval) {
            workoutTimerInterval = setInterval(updateTimerDisplay, 1000);
            updateTimerDisplay();
        }
    }

    function stopTimer() {
        const date = getCurrentDate();
        if (workoutMetadata[date] && workoutMetadata[date].startTime && !workoutMetadata[date].endTime) {
            workoutMetadata[date].endTime = Date.now();
            saveMetadata();
        }
        if (workoutTimerInterval) {
            clearInterval(workoutTimerInterval);
            workoutTimerInterval = null;
        }
        updateTimerDisplay();
    }

    function updateListTitle() {
        const selectedDate = getCurrentDate();
        if (selectedDate === todayStr) {
            menuListTitle.textContent = "今日のメニュー";
        } else {
            const [y, m, d] = selectedDate.split('-');
            menuListTitle.textContent = `${y}年${parseInt(m)}月${parseInt(d)}日のメニュー`;
        }
    }

    function updateCopyDateOptions() {
        const currentDate = getCurrentDate();
        const dates = Object.keys(workoutHistory)
            .filter(date => date !== currentDate && workoutHistory[date].length > 0)
            .sort((a, b) => new Date(b) - new Date(a));

        copyDateSelect.innerHTML = '<option value="" disabled selected>日付を選択</option>';

        if (dates.length === 0) {
            copyDateSelect.innerHTML += '<option value="" disabled>過去の記録がありません</option>';
        } else {
            dates.forEach(date => {
                const [y, m, d] = date.split('-');
                copyDateSelect.innerHTML += `<option value="${date}">${y}年${parseInt(m)}月${parseInt(d)}日</option>`;
            });
        }
    }

    function updateReviewDateOptions() {
        if (!reviewDateSelect) return;
        const currentSelected = reviewDateSelect.value;
        const dates = Object.keys(workoutHistory)
            .filter(date => workoutHistory[date].length > 0)
            .sort((a, b) => new Date(b) - new Date(a));

        reviewDateSelect.innerHTML = '<option value="" disabled selected>日付を選択してください</option>';

        if (dates.length === 0) {
            reviewDateSelect.innerHTML += '<option value="" disabled>記録がありません</option>';
        } else {
            dates.forEach(date => {
                const [y, m, d] = date.split('-');
                let label = `${y}年${parseInt(m)}月${parseInt(d)}日`;
                if (date === todayStr) label += " (今日)";
                reviewDateSelect.innerHTML += `<option value="${date}">${label}</option>`;
            });
        }

        if (currentSelected && dates.includes(currentSelected)) {
            reviewDateSelect.value = currentSelected;
        }
    }

    // --- Category Filter Logic ---
    const originalOptgroups = Array.from(menuExerciseSelect.querySelectorAll('optgroup')).map(optgroup => {
        return {
            label: optgroup.label,
            options: Array.from(optgroup.querySelectorAll('option')).map(option => ({
                value: option.value,
                text: option.textContent
            }))
        };
    });
    const defaultExerciseOption = menuExerciseSelect.querySelector('option[disabled]');

    function loadCustomExercises() {
        const customExercises = JSON.parse(localStorage.getItem('customExercises')) || [];
        customExercises.forEach(ex => {
            const targetGroup = originalOptgroups.find(g => g.label === ex.category);
            if (targetGroup && !targetGroup.options.some(o => o.value === ex.name)) {
                if (ex.category === 'その他') {
                    const otherOptionIdx = targetGroup.options.findIndex(o => o.value === 'その他（自由入力）');
                    if (otherOptionIdx !== -1) {
                        targetGroup.options.splice(otherOptionIdx, 0, { value: ex.name, text: ex.name });
                    } else {
                        targetGroup.options.push({ value: ex.name, text: ex.name });
                    }
                } else {
                    targetGroup.options.push({ value: ex.name, text: ex.name });
                }
            }
        });
    }
    loadCustomExercises();

    function renderExerciseOptions(filterValue) {
        menuExerciseSelect.innerHTML = '';
        if (defaultExerciseOption) {
            menuExerciseSelect.appendChild(defaultExerciseOption.cloneNode(true));
        }

        originalOptgroups.forEach(group => {
            if (filterValue === 'all' || group.label === filterValue) {
                const optgroupEl = document.createElement('optgroup');
                optgroupEl.label = group.label;
                group.options.forEach(opt => {
                    const optionEl = document.createElement('option');
                    optionEl.value = opt.value;
                    optionEl.textContent = opt.text;
                    optgroupEl.appendChild(optionEl);
                });
                menuExerciseSelect.appendChild(optgroupEl);
            }
        });

        if (filterValue !== 'all' && filterValue !== 'その他') {
            const optgroupEl = document.createElement('optgroup');
            optgroupEl.label = "新しい種目を追加";
            const optionEl = document.createElement('option');
            optionEl.value = 'その他（自由入力）';
            optionEl.textContent = 'その他...';
            optgroupEl.appendChild(optionEl);
            menuExerciseSelect.appendChild(optgroupEl);
        }

        menuExerciseSelect.selectedIndex = 0;
        customExerciseContainer.classList.add('hidden');
        customExerciseInput.value = '';
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            renderExerciseOptions(e.target.value);
        });
    }

    menuExerciseSelect.addEventListener('change', (e) => {
        if (e.target.value === 'その他（自由入力）') {
            customExerciseContainer.classList.remove('hidden');
            customExerciseInput.focus();
        } else {
            customExerciseContainer.classList.add('hidden');
            customExerciseInput.value = '';
        }
    });

    function renderMenu() {
        updateListTitle();
        updateCopyDateOptions();

        if (typeof updateMaxRecords === 'function') {
            const currentEx = document.querySelector('input[name="exercise"]:checked').value;
            updateMaxRecords(currentEx);
        }

        const currentExpanded = [];
        document.querySelectorAll('.exercise-details').forEach((el, idx) => {
            currentExpanded[idx] = el.style.display !== 'none';
        });

        workoutMenuList.innerHTML = '';
        const dailyMenu = getDailyMenu();
        let totalVolume = 0;

        if (dailyMenu.length === 0) {
            workoutMenuList.innerHTML = '<li class="empty-message">メニューが登録されていません</li>';
            if (totalVolumeDisplay) {
                totalVolumeDisplay.innerHTML = `0 <span style="font-size: 1rem; font-weight: 400; color: var(--text-secondary);">kg</span>`;
            }
            return;
        }

        daily
