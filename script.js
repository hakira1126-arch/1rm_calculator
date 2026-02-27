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
            menuListTitle.textContent = "TODAY'S MENU";
        } else {
            const [y, m, d] = selectedDate.split('-');
            menuListTitle.textContent = `WORKOUT ON ${y}/${parseInt(m)}/${parseInt(d)}`;
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

        const customSelectContainer = document.getElementById('custom-menu-exercise');
        const customItemsDiv = customSelectContainer ? customSelectContainer.querySelector('.select-items') : null;
        let customHtml = '';

        // Add default placeholder to custom UI
        if (defaultExerciseOption) {
            customHtml += `<div data-value="" class="same-as-selected">${defaultExerciseOption.textContent}</div>`;
        }

        originalOptgroups.forEach(group => {
            if (filterValue === 'all' || group.label === filterValue) {
                const optgroupEl = document.createElement('optgroup');
                optgroupEl.label = group.label;

                customHtml += `<div class="optgroup-label" style="padding: 8px 16px; color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; cursor: default;">${group.label}</div>`;

                group.options.forEach(opt => {
                    const optionEl = document.createElement('option');
                    optionEl.value = opt.value;
                    optionEl.textContent = opt.text;
                    optgroupEl.appendChild(optionEl);

                    customHtml += `<div data-value="${opt.value}">${opt.text}</div>`;
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

            customHtml += `<div class="optgroup-label" style="padding: 8px 16px; color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; cursor: default;">新しい種目を追加</div>`;
            customHtml += `<div data-value="その他（自由入力）">その他...</div>`;
        }

        menuExerciseSelect.selectedIndex = 0;

        // Update custom select UI (hidden, kept for compatibility)
        if (customSelectContainer && customItemsDiv) {
            customItemsDiv.innerHTML = customHtml;
            const selectedDiv = customSelectContainer.querySelector('.select-selected');
            if (selectedDiv) {
                selectedDiv.innerHTML = "種目を選択してください";
            }
        }

        // Update exercise modal list
        const exerciseModalList = document.getElementById('exercise-modal-list');
        if (exerciseModalList) {
            let modalHtml = '';
            originalOptgroups.forEach(group => {
                if (filterValue === 'all' || group.label === filterValue) {
                    modalHtml += `<div class="category-modal-group-label">${group.label}</div>`;
                    group.options.forEach(opt => {
                        modalHtml += `<div class="category-modal-item" data-value="${opt.value}">${opt.text}</div>`;
                    });
                }
            });
            if (filterValue !== 'all' && filterValue !== 'その他') {
                modalHtml += `<div class="category-modal-group-label">新しい種目を追加</div>`;
                modalHtml += `<div class="category-modal-item" data-value="その他（自由入力）">その他...</div>`;
            }
            exerciseModalList.innerHTML = modalHtml;
        }

        // Reset exercise button label
        const exerciseSelectLabel = document.getElementById('exercise-select-label');
        if (exerciseSelectLabel) {
            exerciseSelectLabel.textContent = '種目を選択してください';
        }

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
        let totalSets = 0;

        if (dailyMenu.length === 0) {
            workoutMenuList.innerHTML = '<li class="empty-message">メニューが登録されていません</li>';
            if (totalVolumeDisplay) {
                totalVolumeDisplay.innerHTML = `0 <span style="font-size: 1rem; font-weight: 400; color: var(--text-secondary);">kg</span>`;
            }
            const totalSetsDisplay = document.getElementById('total-sets-value');
            if (totalSetsDisplay) totalSetsDisplay.textContent = '0';
            return;
        }

        dailyMenu.forEach((item, exerciseIndex) => {
            const li = document.createElement('li');
            li.className = 'menu-item';
            li.style.flexDirection = 'column';
            li.style.alignItems = 'stretch';

            let exerciseVolume = 0;
            totalSets += item.sets.length;

            // Generate set rows HTML
            let setsHtml = '';
            item.sets.forEach((set, setIndex) => {
                const isCompleted = set.completed ? 'completed' : '';
                const isChecked = set.completed ? 'checked' : '';

                const weight = parseFloat(set.weight) || 0;
                const reps = parseInt(set.reps, 10) || 0;

                if (weight > 0 && reps > 0) {
                    exerciseVolume += weight * reps;
                    totalVolume += weight * reps;
                }

                const rpe = set.rpe !== undefined ? set.rpe : '';
                const rpeOptions = ['-', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => {
                    const valueAttr = val === '-' ? '' : val;
                    const isSelected = rpe == valueAttr ? 'selected' : '';
                    return `<option value="${valueAttr}" ${isSelected}>${val}</option>`;
                }).join('');

                setsHtml += `
                    <div class="set-row ${isCompleted}" data-ex-idx="${exerciseIndex}" data-set-idx="${setIndex}">
                        <span class="set-number">${setIndex + 1}</span>
                        <div class="grid-input-wrapper">
                            <input type="number" class="mini-input set-weight" value="${set.weight === '' || set.weight === 0 ? '' : set.weight}" min="0" step="0.5" placeholder="kg">
                        </div>
                        <div class="grid-input-wrapper">
                            <input type="number" class="mini-input set-reps" value="${set.reps === '' || set.reps === 0 ? '' : set.reps}" min="0" step="1" placeholder="reps">
                        </div>
                        <div class="grid-checkbox-wrapper">
                            <input type="checkbox" class="set-checkbox" ${isChecked} title="DONE">
                        </div>
                        <div style="display: flex; justify-content: center;">
                            <button class="remove-set-btn" title="REMOVE" style="font-size: 1.1rem; opacity: 0.4;">×</button>
                        </div>
                    </div>
                `;
            });

            const isExpanded = currentExpanded[exerciseIndex] !== false;
            const displayStyle = isExpanded ? 'block' : 'none';
            const toggleIcon = isExpanded ? '▼' : '▶';

            const exerciseMemo = item.memo || '';

            li.innerHTML = `
                <div class="menu-header" style="cursor: pointer; user-select: none;" title="タップして開閉">
                    <div style="flex: 1; pointer-events: none;">
                        <span class="title">${item.exercise}</span>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">Vol: <span style="color: var(--text-primary); font-weight: 600;">${exerciseVolume.toLocaleString()}</span> kg ／ <span style="color: var(--text-primary); font-weight: 600;">${item.sets.length}</span> sets</div>
                    </div>
                    <div class="header-actions" style="display: flex; align-items: center; gap: 1rem;">
                        <span class="toggle-icon" style="font-size: 1.1rem; color: var(--text-secondary);">${toggleIcon}</span>
                        <button class="delete-exercise-btn" data-index="${exerciseIndex}" title="Delete exercise" style="pointer-events: auto; position: relative; z-index: 10;">🗑️</button>
                    </div>
                </div>
                <div class="exercise-details" style="display: ${displayStyle}; margin-top: 1rem;">
                    <div class="set-header-row">
                        <span>SET</span>
                        <span>KG</span>
                        <span>REPS</span>
                        <span>DONE</span>
                        <span></span>
                    </div>
                    <div class="sets-container">
                        ${setsHtml}
                    </div>
                    <button class="add-set-btn" data-index="${exerciseIndex}" style="border-style: solid; border-width: 1px; background: rgba(255,255,255,0.03); color: var(--text-primary); font-weight: 600; letter-spacing: 0.05em; margin-top: 1.5rem;">+ ADD SET</button>
                    <div style="margin-top: 1.5rem;">
                        <textarea class="exercise-memo" placeholder="NOTES (FOCUS, FEELING, ETC...)" data-index="${exerciseIndex}">${exerciseMemo}</textarea>
                    </div>
                </div>
            `;

            workoutMenuList.appendChild(li);
        });

        if (totalVolumeDisplay) {
            totalVolumeDisplay.innerHTML = `${totalVolume.toLocaleString()} <span style="font-size: 1rem; font-weight: 400; color: var(--text-secondary);">kg</span>`;
        }
        const totalSetsDisplay = document.getElementById('total-sets-value');
        if (totalSetsDisplay) {
            totalSetsDisplay.textContent = totalSets;
        }

        if (workoutTimerInterval) {
            clearInterval(workoutTimerInterval);
            workoutTimerInterval = null;
        }
        updateTimerDisplay();
        const date = getCurrentDate();
        if (workoutMetadata[date] && workoutMetadata[date].startTime && !workoutMetadata[date].endTime) {
            workoutTimerInterval = setInterval(updateTimerDisplay, 1000);
        }

        attachMenuEventListeners();
    }

    function attachMenuEventListeners() {
        document.querySelectorAll('.menu-header').forEach(header => {
            header.addEventListener('click', (e) => {
                if (e.target.closest('.delete-exercise-btn')) return;

                const details = header.nextElementSibling;
                const icon = header.querySelector('.toggle-icon');
                if (details.style.display === 'none') {
                    details.style.display = 'block';
                    icon.textContent = '▼';
                } else {
                    details.style.display = 'none';
                    icon.textContent = '▶';
                }
            });
        });

        document.querySelectorAll('.delete-exercise-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                const date = getCurrentDate();
                if (confirm('Delete this exercise and all its sets?')) {
                    workoutHistory[date].splice(idx, 1);
                    if (workoutHistory[date].length === 0) delete workoutHistory[date];
                    saveHistory();
                    renderMenu();
                }
            });
        });

        document.querySelectorAll('.add-set-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const exIdx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                const date = getCurrentDate();
                const sets = workoutHistory[date][exIdx].sets;

                let newWeight = 0, newReps = 0;
                if (sets.length > 0) {
                    const lastSet = sets[sets.length - 1];
                    newWeight = lastSet.weight;
                    newReps = lastSet.reps;
                }

                sets.push({ weight: newWeight, reps: newReps, completed: false });
                saveHistory();
                renderMenu();
            });
        });

        document.querySelectorAll('.remove-set-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.currentTarget.closest('.set-row');
                const exIdx = parseInt(row.getAttribute('data-ex-idx'), 10);
                const setIdx = parseInt(row.getAttribute('data-set-idx'), 10);
                const date = getCurrentDate();

                workoutHistory[date][exIdx].sets.splice(setIdx, 1);

                if (workoutHistory[date][exIdx].sets.length === 0) {
                    workoutHistory[date].splice(exIdx, 1);
                    if (workoutHistory[date].length === 0) delete workoutHistory[date];
                }

                saveHistory();
                renderMenu();
            });
        });

        document.querySelectorAll('.set-weight, .set-reps, .set-rpe').forEach(input => {
            input.addEventListener('change', (e) => {
                const row = e.currentTarget.closest('.set-row');
                const exIdx = parseInt(row.getAttribute('data-ex-idx'), 10);
                const setIdx = parseInt(row.getAttribute('data-set-idx'), 10);
                const date = getCurrentDate();

                const targetSet = workoutHistory[date][exIdx].sets[setIdx];

                if (e.currentTarget.classList.contains('set-weight')) {
                    targetSet.weight = parseFloat(e.currentTarget.value) || 0;
                } else if (e.currentTarget.classList.contains('set-reps')) {
                    targetSet.reps = parseInt(e.currentTarget.value, 10) || 0;
                } else if (e.currentTarget.classList.contains('set-rpe')) {
                    const rpeVal = e.currentTarget.value;
                    targetSet.rpe = rpeVal === '' ? '' : parseInt(rpeVal, 10);
                }

                saveHistory();
            });
        });

        document.querySelectorAll('.exercise-memo').forEach(memoInput => {
            memoInput.addEventListener('change', (e) => {
                const exIdx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                const date = getCurrentDate();

                workoutHistory[date][exIdx].memo = e.currentTarget.value;
                saveHistory();
            });
        });

        document.querySelectorAll('.set-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const row = e.currentTarget.closest('.set-row');
                const exIdx = parseInt(row.getAttribute('data-ex-idx'), 10);
                const setIdx = parseInt(row.getAttribute('data-set-idx'), 10);
                const date = getCurrentDate();

                const isChecked = e.currentTarget.checked;
                workoutHistory[date][exIdx].sets[setIdx].completed = isChecked;

                if (isChecked) {
                    row.classList.add('completed');
                    startTimerIfNeeded();
                    startRestTimer();
                } else {
                    row.classList.remove('completed');
                    stopRestTimer();
                }

                saveHistory();
            });
        });
    }

    // --- Rest Timer Logic ---
    let restTimerInterval = null;
    let restTimeRemaining = 0;

    const restTimerUi = document.getElementById('rest-timer-ui');
    const restTimerDisplay = document.getElementById('rest-timer-display');
    const restTimerSkipBtn = document.getElementById('rest-timer-skip-btn');
    const restTimerDurationSelect = document.getElementById('rest-timer-duration');

    const savedRestTime = localStorage.getItem('restTimerPreference');
    if (savedRestTime && restTimerDurationSelect) {
        restTimerDurationSelect.value = savedRestTime;
    }

    if (restTimerDurationSelect) {
        restTimerDurationSelect.addEventListener('change', (e) => {
            localStorage.setItem('restTimerPreference', e.target.value);
        });
    }

    function formatRestTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function startRestTimer() {
        if (!restTimerUi || !restTimerDisplay || !restTimerDurationSelect) return;

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        if (restTimerInterval) {
            clearInterval(restTimerInterval);
        }

        const selectedDuration = parseInt(restTimerDurationSelect.value, 10) || 90;
        restTimeRemaining = selectedDuration;

        restTimerDisplay.textContent = formatRestTime(restTimeRemaining);
        restTimerDisplay.classList.remove('finished');
        restTimerUi.classList.remove('hidden');
        restTimerUi.classList.remove('rest-finished-flash');

        const label = restTimerUi.querySelector('.rest-timer-label');
        if (label) label.textContent = "REST";

        restTimerInterval = setInterval(() => {
            restTimeRemaining--;

            if (restTimeRemaining > 0) {
                restTimerDisplay.textContent = formatRestTime(restTimeRemaining);
            } else {
                clearInterval(restTimerInterval);
                restTimerInterval = null;
                restTimerDisplay.textContent = "READY";
                restTimerDisplay.classList.add('finished');
                restTimerUi.classList.add('rest-finished-flash');
                if (label) label.textContent = "UP NEXT";

                // Play simple alarm beep using Web Audio API
                playAlarmSound();

                // Show Browser Notification
                showRestNotification();

                // Auto-hide after 15 seconds (give more time to see READY)
                setTimeout(() => {
                    stopRestTimer();
                }, 15000);
            }
        }, 1000);
    }

    function playAlarmSound() {
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();

            const playBeep = (delay) => {
                const oscillator = context.createOscillator();
                const gain = context.createGain();

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, context.currentTime + delay); // A5

                gain.gain.setValueAtTime(0, context.currentTime + delay);
                gain.gain.linearRampToValueAtTime(0.2, context.currentTime + delay + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + delay + 0.5);

                oscillator.connect(gain);
                gain.connect(context.destination);

                oscillator.start(context.currentTime + delay);
                oscillator.stop(context.currentTime + delay + 0.5);
            };

            // Play 3 beeps with 500ms intervals
            playBeep(0);
            playBeep(0.5);
            playBeep(1.0);
        } catch (e) {
            console.error('Audio play failed:', e);
        }
    }

    function showRestNotification() {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            new Notification('休憩終了', {
                body: '次のセットを開始しましょう！',
                icon: './icon-192.png'
            });
        }
    }

    function stopRestTimer() {
        if (restTimerInterval) {
            clearInterval(restTimerInterval);
            restTimerInterval = null;
        }
        if (restTimerUi) {
            restTimerUi.classList.add('hidden');
        }
        if (restTimerDisplay) {
            restTimerDisplay.classList.remove('finished');
            restTimerDisplay.style.fontSize = "";
        }
    }

    if (restTimerSkipBtn) {
        restTimerSkipBtn.addEventListener('click', stopRestTimer);
    }

    workoutDateInput.addEventListener('change', () => {
        renderMenu();
    });

    // --- Wizard Navigation Logic ---
    function showWizardStep(stepNumber) {
        wizardStep1.classList.remove('wizard-animating');
        wizardStep2.classList.remove('wizard-animating');
        wizardStep3.classList.remove('wizard-animating');

        wizardStep1.style.display = 'none';
        wizardStep2.style.display = 'none';
        wizardStep3.style.display = 'none';

        const ind1 = document.getElementById('indicator-step-1');
        const ind2 = document.getElementById('indicator-step-2');
        const ind3 = document.getElementById('indicator-step-3');
        if (ind1) ind1.classList.remove('active');
        if (ind2) ind2.classList.remove('active');
        if (ind3) ind3.classList.remove('active');

        let targetStep;
        if (stepNumber === 1) {
            targetStep = wizardStep1;
            if (ind1) ind1.classList.add('active');
        } else if (stepNumber === 2) {
            targetStep = wizardStep2;
            if (ind2) ind2.classList.add('active');
        } else if (stepNumber === 3) {
            targetStep = wizardStep3;
            if (ind3) ind3.classList.add('active');
        }

        if (targetStep) {
            targetStep.style.display = 'block';
            void targetStep.offsetWidth;
            targetStep.classList.add('wizard-animating');
        }
    }

    step1NextBtn.addEventListener('click', () => {
        const date = getCurrentDate();
        if (!date) {
            alert('日付を選択してください。');
            return;
        }
        updateCopyDateOptions();
        showWizardStep(2);
    });

    step2BackBtn.addEventListener('click', () => {
        showWizardStep(1);
    });

    step2NewBtn.addEventListener('click', () => {
        renderMenu();
        showWizardStep(3);
    });

    step3BackBtn.addEventListener('click', () => {
        showWizardStep(2);
    });

    workoutDateInput.addEventListener('change', () => {
        renderMenu();
    });

    addMenuBtn.addEventListener('click', () => {
        let exercise = menuExerciseSelect.value;
        let category = null;

        if (exercise === 'その他（自由入力）') {
            exercise = customExerciseInput.value.trim();
            category = categoryFilter.value;

            if (!exercise || exercise === '') {
                alert('種目名を入力してください。');
                addMenuBtn.style.transform = 'scale(0.95)';
                setTimeout(() => addMenuBtn.style.transform = '', 150);
                return;
            }

            const customExercises = JSON.parse(localStorage.getItem('customExercises')) || [];
            if (!customExercises.some(ex => ex.name === exercise)) {
                customExercises.push({ name: exercise, category: category });
                localStorage.setItem('customExercises', JSON.stringify(customExercises));

                const group = originalOptgroups.find(g => g.label === category);
                if (group) {
                    group.options.push({ value: exercise, text: exercise });
                }
            }
        }

        if (!exercise || exercise === '') {
            addMenuBtn.style.transform = 'scale(0.95)';
            setTimeout(() => addMenuBtn.style.transform = '', 150);
            return;
        }

        const date = getCurrentDate();
        if (!workoutHistory[date]) {
            workoutHistory[date] = [];
        }

        const setsToSave = [{ weight: '', reps: '', completed: false }];

        workoutHistory[date].push({
            exercise: exercise,
            sets: setsToSave
        });

        saveHistory();

        renderExerciseOptions(categoryFilter.value);
        renderMenu();

        menuExerciseSelect.selectedIndex = 0;
        customExerciseContainer.classList.add('hidden');
        customExerciseInput.value = '';
    });

    async function shareWorkoutToGemini() {
        const date = getCurrentDate();
        const dailyMenu = workoutHistory[date];

        if (!dailyMenu || dailyMenu.length === 0) {
            return;
        }

        let workoutText = `【${date} の筋トレ記録】\n`;

        const meta = workoutMetadata[date];
        if (meta && meta.startTime && meta.endTime) {
            const durationMs = meta.endTime - meta.startTime;
            workoutText += `所要時間：${formatTime(durationMs)}\n`;
        }
        workoutText += `\n`;

        dailyMenu.forEach(item => {
            workoutText += `種目：${item.exercise}\n`;
            item.sets.forEach((set, index) => {
                const status = set.completed ? '完了' : '未完了';
                workoutText += `・${index + 1}セット：${set.weight}kg × ${set.reps}回\n`;
            });
            workoutText += '\n';
        });

        workoutText += `このトレーニングメニューのボリュームや、次回の重量設定について、AIパーソナルトレーナーとしてアドバイスをお願いします！`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: '今日の筋トレ記録',
                    text: workoutText,
                });
            } catch (error) {
                console.log('シェアがキャンセルされました', error);
            }
        } else {
            alert('お使いのブラウザはシェア機能に対応していません。\n\n' + workoutText);
        }
    }

    saveMenuBtn.addEventListener('click', () => {
        const date = getCurrentDate();
        const dailyMenu = workoutHistory[date];
        let uncompletedDetails = [];

        if (dailyMenu && dailyMenu.length > 0) {
            dailyMenu.forEach(item => {
                const uncompletedCount = item.sets.filter(set => !set.completed).length;
                if (uncompletedCount > 0) {
                    uncompletedDetails.push({ name: item.exercise, count: uncompletedCount });
                }
            });
        }

        if (uncompletedDetails.length > 0) {
            modalUncompletedList.innerHTML = '';
            uncompletedDetails.forEach(detail => {
                const li = document.createElement('li');

                const nameSpan = document.createElement('span');
                nameSpan.className = 'ex-name';
                nameSpan.textContent = `・ ${detail.name}`;

                const countSpan = document.createElement('span');
                countSpan.className = 'ex-count';
                countSpan.textContent = `[残り ${detail.count} セット]`;

                li.appendChild(nameSpan);
                li.appendChild(countSpan);
                modalUncompletedList.appendChild(li);
            });
            customAlertModal.classList.remove('hidden');
            return;
        }

        saveHistory();
        stopTimer();

        shareWorkoutToGemini();

        const originalText = saveMenuBtn.textContent;
        saveMenuBtn.textContent = 'SAVED! ✓';
        saveMenuBtn.style.background = '#ffffff';
        saveMenuBtn.style.color = '#000000';

        setTimeout(() => {
            saveMenuBtn.textContent = originalText;
            saveMenuBtn.style.background = '';
            saveMenuBtn.style.color = '';

            const reviewTabBtn = document.querySelector('.tab-btn[data-tab="review-tab"]');
            if (reviewTabBtn) {
                reviewTabBtn.click();
            }
        }, 1500);
    });

    modalCloseBtn.addEventListener('click', () => {
        customAlertModal.classList.add('hidden');
    });

    clearMenuBtn.addEventListener('click', () => {
        const date = getCurrentDate();
        const displayDate = date === todayStr ? 'Today' : date;

        if (confirm(`Clear all menu items for ${displayDate}?`)) {
            delete workoutHistory[date];
            if (workoutMetadata[date]) {
                delete workoutMetadata[date].startTime;
                delete workoutMetadata[date].endTime;
            }
            saveHistory();
            saveMetadata();
            renderMenu();
        }
    });

    copyMenuBtn.addEventListener('click', () => {
        const sourceDate = copyDateSelect.value;
        if (!sourceDate) {
            alert('コピー元の日付を選択してください。');
            return;
        }

        const targetDate = getCurrentDate();
        const sourceMenu = workoutHistory[sourceDate];

        if (!sourceMenu || sourceMenu.length === 0) return;

        if (workoutHistory[targetDate] && workoutHistory[targetDate].length > 0) {
            if (!confirm('すでにこの日のメニューが登録されています。追加でコピーしますか？')) {
                return;
            }
        }

        if (!workoutHistory[targetDate]) {
            workoutHistory[targetDate] = [];
        }

        const copiedMenu = JSON.parse(JSON.stringify(sourceMenu));
        copiedMenu.forEach(item => {
            item.sets.forEach(set => {
                set.completed = false;
            });
        });

        workoutHistory[targetDate].push(...copiedMenu);
        saveHistory();
        renderMenu();

        const originalText = copyMenuBtn.textContent;
        copyMenuBtn.textContent = 'コピー完了！';
        copyMenuBtn.style.background = '#ffffff';
        copyMenuBtn.style.color = '#000000';
        setTimeout(() => {
            copyMenuBtn.textContent = originalText;
            copyMenuBtn.style.background = '';
            copyMenuBtn.style.color = '';
            showWizardStep(3);
        }, 1000);
    });

    // --- Review Tab Logic ---
    function renderReviewTab() {
        if (!reviewDateSelect || !reviewDateTitle) return;
        const date = reviewDateSelect.value;

        if (!date || !workoutHistory[date] || workoutHistory[date].length === 0) {
            reviewDetails.style.display = 'none';
            reviewEmptyMessage.style.display = 'block';
            return;
        }

        reviewEmptyMessage.style.display = 'none';
        reviewDetails.style.display = 'block';

        const [y, m, d] = date.split('-');
        reviewDateTitle.textContent = `${y}/${parseInt(m)}/${parseInt(d)} WORKOUT`;

        let totalVolume = 0;
        let totalSets = 0;
        reviewWorkoutList.innerHTML = '';

        workoutHistory[date].forEach((item, exerciseIndex) => {
            const li = document.createElement('li');
            li.className = 'menu-item';
            li.style.flexDirection = 'column';
            li.style.alignItems = 'stretch';
            li.style.gap = '0';

            let setsHtml = '';
            let exerciseVolume = 0;

            item.sets.forEach((set, setIndex) => {
                const weight = parseFloat(set.weight) || 0;
                const reps = parseInt(set.reps, 10) || 0;
                const isCompleted = set.completed ? 'completed' : '';
                const isCheckedAttr = set.completed ? 'checked' : '';

                if (set.completed) {
                    totalSets++;
                    if (weight > 0 && reps > 0) {
                        exerciseVolume += weight * reps;
                        totalVolume += weight * reps;
                    }
                }

                const rpeDisplay = set.rpe ? `<span style="color: var(--text-secondary); font-size: 0.8em; margin-left: 0.5rem;">[RPE: ${set.rpe}]</span>` : '';

                setsHtml += `
                    <div class="set-row ${isCompleted}" style="pointer-events: none; opacity: ${set.completed ? '1' : '0.5'};">
                        <span class="set-number">${setIndex + 1}</span>
                        <div class="grid-input-wrapper">
                            <span style="color: var(--text-primary); font-weight: 600;">${set.weight} <small style="color: var(--text-secondary); font-size: 0.75rem;">kg</small></span>
                        </div>
                        <div class="grid-input-wrapper">
                            <span style="color: var(--text-primary); font-weight: 600;">${set.reps} <small style="color: var(--text-secondary); font-size: 0.75rem;">reps</small>${rpeDisplay}</span>
                        </div>
                        <div class="grid-checkbox-wrapper">
                            <input type="checkbox" class="set-checkbox" ${isCheckedAttr} disabled>
                        </div>
                        <div></div>
                    </div>
                `;
            });

            const memoDisplay = item.memo ? `<div style="margin-top: 1rem; padding: 0.8rem; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.85rem; white-space: pre-wrap;">📝 ${item.memo}</div>` : '';

            li.innerHTML = `
                <div class="menu-header" style="cursor: pointer; user-select: none;" title="タップして開閉">
                    <div style="flex: 1; pointer-events: none;">
                        <span class="title">${item.exercise}</span>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">Vol: <span style="color: var(--text-primary); font-weight: 600;">${exerciseVolume.toLocaleString()}</span> kg ／ <span style="color: var(--text-primary); font-weight: 600;">${item.sets.length}</span> sets</div>
                    </div>
                    <div class="header-actions" style="display: flex; align-items: center; gap: 1rem;">
                        <span class="toggle-icon" style="font-size: 1.1rem; color: var(--text-secondary);">▼</span>
                    </div>
                </div>
                <div class="exercise-details" style="display: block; margin-top: 1rem;">
                    <div class="set-header-row">
                        <span>SET</span>
                        <span>KG</span>
                        <span>REPS/RPE</span>
                        <span>DONE</span>
                        <span></span>
                    </div>
                    <div class="sets-container">
                        ${setsHtml}
                    </div>
                    ${memoDisplay}
                </div>
            `;

            const header = li.querySelector('.menu-header');
            header.addEventListener('click', () => {
                const details = header.nextElementSibling;
                const icon = header.querySelector('.toggle-icon');
                if (details.style.display === 'none') {
                    details.style.display = 'block';
                    icon.textContent = '▼';
                } else {
                    details.style.display = 'none';
                    icon.textContent = '▶';
                }
            });

            reviewWorkoutList.appendChild(li);
        });

        reviewTotalVolume.innerHTML = `${totalVolume.toLocaleString()} <span style="font-size: 1rem; font-weight: 400; color: var(--text-secondary);">kg</span>`;
        const reviewTotalSets = document.getElementById('review-total-sets');
        if (reviewTotalSets) {
            reviewTotalSets.textContent = totalSets;
        }

        // --- Data Backup (Export/Import) Logic ---
        const exportBtn = document.getElementById('export-data-btn');
        const importBtn = document.getElementById('import-data-btn');
        const importInput = document.getElementById('import-file-input');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const dataToExport = {
                    workoutHistory: JSON.parse(localStorage.getItem('workoutHistory') || '{}'),
                    workoutMetadata: JSON.parse(localStorage.getItem('workoutMetadata') || '{}'),
                    customExercises: JSON.parse(localStorage.getItem('customExercises') || '[]'),
                    exportDate: new Date().toISOString()
                };

                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
                const downloadAnchorNode = document.createElement('a');
                const dateStr = getCurrentDate().replace(/\//g, '');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", `1rm_backup_${dateStr}.json`);
                document.body.appendChild(downloadAnchorNode); // required for firefox
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
            });
        }

        if (importBtn && importInput) {
            importBtn.addEventListener('click', () => {
                importInput.click();
            });

            importInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = function (event) {
                    try {
                        const importedData = JSON.parse(event.target.result);

                        if (!importedData.workoutHistory && !importedData.workoutMetadata) {
                            alert('Invalid backup file.');
                            return;
                        }

                        const confirmMsg = "Restore data from backup?\n\n[OK]: OVERWRITE current data\n[CANCEL]: MERGE with current data\n\n*This action cannot be undone.";
                        const isOverwrite = confirm(confirmMsg);

                        if (isOverwrite) {
                            // Overwrite
                            if (importedData.workoutHistory) localStorage.setItem('workoutHistory', JSON.stringify(importedData.workoutHistory));
                            if (importedData.workoutMetadata) localStorage.setItem('workoutMetadata', JSON.stringify(importedData.workoutMetadata));
                            if (importedData.customExercises) localStorage.setItem('customExercises', JSON.stringify(importedData.customExercises));
                        } else {
                            // Merge
                            const currentHistory = JSON.parse(localStorage.getItem('workoutHistory') || '{}');
                            const currentMeta = JSON.parse(localStorage.getItem('workoutMetadata') || '{}');
                            let currentCustomEx = JSON.parse(localStorage.getItem('customExercises') || '[]');

                            // Merge custom exercises uniquely
                            if (importedData.customExercises) {
                                importedData.customExercises.forEach(ex => {
                                    if (!currentCustomEx.some(c => c.name === ex.name)) {
                                        currentCustomEx.push(ex);
                                    }
                                });
                            }

                            // Merge history (if same date exists, imported data replaces it)
                            const mergedHistory = { ...currentHistory, ...(importedData.workoutHistory || {}) };
                            const mergedMeta = { ...currentMeta, ...(importedData.workoutMetadata || {}) };

                            localStorage.setItem('workoutHistory', JSON.stringify(mergedHistory));
                            localStorage.setItem('workoutMetadata', JSON.stringify(mergedMeta));
                            localStorage.setItem('customExercises', JSON.stringify(currentCustomEx));
                        }

                        // Reload memory variables
                        workoutHistory = JSON.parse(localStorage.getItem('workoutHistory') || '{}');
                        workoutMetadata = JSON.parse(localStorage.getItem('workoutMetadata') || '{}');

                        alert('Data restoration complete. The page will now reload.');
                        location.reload();

                    } catch (err) {
                        alert('Failed to load file. The file might be corrupted.\n' + err.message);
                    } finally {
                        importInput.value = ''; // Reset input
                    }
                };
                reader.readAsText(file);
            });
        }
        const meta = workoutMetadata[date];
        if (meta && meta.startTime && meta.endTime) {
            reviewDuration.textContent = formatTime(meta.endTime - meta.startTime);
        } else if (meta && meta.startTime) {
            reviewDuration.textContent = formatTime(Date.now() - meta.startTime) + " (記録中)";
        } else {
            reviewDuration.textContent = "--:--:--";
        }
    }

    if (reviewDateSelect) {
        reviewDateSelect.addEventListener('change', renderReviewTab);
    }

    updateReviewDateOptions();

    // Max calculation logic
    const exerciseNamesMap = {
        'benchpress': 'ベンチプレス',
        'deadlift': 'デッドリフト',
        'squat': 'スクワット'
    };

    const exerciseDisplayNames = {
        'benchpress': 'BENCH PRESS',
        'deadlift': 'DEADLIFT',
        'squat': 'SQUAT'
    };

    function updateMaxRecords(exerciseKey) {
        if (typeof workoutHistory === 'undefined' || !workoutHistory) return;

        const targetExerciseName = exerciseNamesMap[exerciseKey];
        if (!targetExerciseName) return;

        recordExerciseName.textContent = exerciseDisplayNames[exerciseKey];

        let maxWeight = 0;
        let maxWeightDate = '--';
        let max1rm = 0;
        let max1rmDate = '--';

        for (const date in workoutHistory) {
            const dailyMenu = workoutHistory[date];
            dailyMenu.forEach(item => {
                if (item.exercise.includes(targetExerciseName)) {
                    item.sets.forEach(set => {
                        const weight = parseFloat(set.weight) || 0;
                        const reps = parseInt(set.reps, 10) || 0;

                        if (weight > 0 && reps > 0) {
                            if (weight > maxWeight) {
                                maxWeight = weight;
                                maxWeightDate = date;
                            }
                            const epley = calculateEpley(weight, reps);
                            const brzycki = calculateBrzycki(weight, reps);
                            const oconner = calculateOconner(weight, reps);
                            const average1Rm = (epley + brzycki + oconner) / 3;

                            if (average1Rm > max1rm) {
                                max1rm = average1Rm;
                                max1rmDate = date;
                            }
                        }
                    });
                }
            });
        }

        if (maxWeight > 0 || max1rm > 0) {
            recordMaxWeight.textContent = maxWeight > 0 ? `${maxWeight} kg` : '-- kg';
            recordMaxWeightDate.textContent = maxWeight > 0 ? maxWeightDate : '--';

            recordMax1rm.textContent = max1rm > 0 ? `${max1rm.toFixed(1)} kg` : '-- kg';
            recordMax1rmDate.textContent = max1rm > 0 ? max1rmDate : '--';

            recordSection.style.display = 'block';
        } else {
            recordSection.style.display = 'none';
        }
    }

    // ==========================================
    // データ管理・バックアップ機能（エクスポート/インポート）
    // ==========================================
    const exportBtn = document.getElementById('export-data-btn');
    const importBtn = document.getElementById('import-data-btn');
    const importInput = document.getElementById('import-file-input');

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const dataToExport = {
                workoutHistory: JSON.parse(localStorage.getItem('workoutHistory') || '{}'),
                workoutMetadata: JSON.parse(localStorage.getItem('workoutMetadata') || '{}'),
                customExercises: JSON.parse(localStorage.getItem('customExercises') || '[]'),
                exportDate: new Date().toISOString()
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
            const downloadAnchorNode = document.createElement('a');
            const dateStr = getCurrentDate().replace(/-/g, '');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `1rm_backup_${dateStr}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        });
    }

    if (importBtn && importInput) {
        importBtn.addEventListener('click', () => {
            importInput.click();
        });

        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (event) {
                try {
                    const importedData = JSON.parse(event.target.result);

                    if (!importedData.workoutHistory && !importedData.workoutMetadata) {
                        alert('無効なバックアップファイルです。');
                        return;
                    }

                    const confirmMsg = "データを復元します。\n\n[OK]: 現在のデータに上書き保存します\n[キャンセル]: 現在のデータに結合(追加)します\n\n※どちらにせよ一度インポートしたデータは元に戻せません。";
                    const isOverwrite = confirm(confirmMsg);

                    if (isOverwrite) {
                        if (importedData.workoutHistory) localStorage.setItem('workoutHistory', JSON.stringify(importedData.workoutHistory));
                        if (importedData.workoutMetadata) localStorage.setItem('workoutMetadata', JSON.stringify(importedData.workoutMetadata));
                        if (importedData.customExercises) localStorage.setItem('customExercises', JSON.stringify(importedData.customExercises));
                    } else {
                        const currentHistory = JSON.parse(localStorage.getItem('workoutHistory') || '{}');
                        const currentMeta = JSON.parse(localStorage.getItem('workoutMetadata') || '{}');
                        let currentCustomEx = JSON.parse(localStorage.getItem('customExercises') || '[]');

                        if (importedData.customExercises) {
                            importedData.customExercises.forEach(ex => {
                                if (!currentCustomEx.some(c => c.name === ex.name)) {
                                    currentCustomEx.push(ex);
                                }
                            });
                        }

                        const mergedHistory = { ...currentHistory, ...(importedData.workoutHistory || {}) };
                        const mergedMeta = { ...currentMeta, ...(importedData.workoutMetadata || {}) };

                        localStorage.setItem('workoutHistory', JSON.stringify(mergedHistory));
                        localStorage.setItem('workoutMetadata', JSON.stringify(mergedMeta));
                        localStorage.setItem('customExercises', JSON.stringify(currentCustomEx));
                    }

                    workoutHistory = JSON.parse(localStorage.getItem('workoutHistory') || '{}');
                    workoutMetadata = JSON.parse(localStorage.getItem('workoutMetadata') || '{}');

                    alert('データの復元が完了しました。画面を更新(リロード)します。');
                    location.reload();

                } catch (err) {
                    alert('ファイルの読み込みに失敗しました。ファイルが壊れている可能性があります。\n' + err.message);
                } finally {
                    importInput.value = '';
                }
            };
            reader.readAsText(file);
        });
    }

    // Initial render
    renderMenu();
    updateMaxRecords(document.querySelector('input[name="exercise"]:checked').value);

    // --- Custom Select Box Logic ---
    function setupCustomSelect(customSelectId, onChangeCallback) {
        const customSelect = document.getElementById(customSelectId);
        if (!customSelect) return;

        const selectEl = customSelect.querySelector('select');
        const selectedDiv = customSelect.querySelector('.select-selected');
        const itemsDiv = customSelect.querySelector('.select-items');

        if (!selectEl || !selectedDiv || !itemsDiv) return;

        // Sync initial value
        if (selectEl.options.length > 0 && selectEl.selectedIndex >= 0) {
            selectedDiv.innerHTML = selectEl.options[selectEl.selectedIndex].innerHTML;
        }

        // Remove old listeners to prevent duplicates if called multiple times
        const newSelectedDiv = selectedDiv.cloneNode(true);
        selectedDiv.parentNode.replaceChild(newSelectedDiv, selectedDiv);

        const newItemsDiv = itemsDiv.cloneNode(true);
        itemsDiv.parentNode.replaceChild(newItemsDiv, itemsDiv);

        // Toggle dropdown
        newSelectedDiv.addEventListener('click', function (e) {
            e.stopPropagation();
            closeAllCustomSelects(this);
            newItemsDiv.classList.toggle('select-hide');
            this.classList.toggle('select-arrow-active');

            if (this.classList.contains('select-arrow-active')) {
                this.parentNode.style.zIndex = '999';
            } else {
                this.parentNode.style.zIndex = '1';
            }
        });

        // Delegate click for options
        newItemsDiv.addEventListener('click', function (e) {
            e.stopPropagation();
            if (e.target && e.target.nodeName === "DIV" && !e.target.classList.contains('optgroup-label')) {
                const value = e.target.getAttribute('data-value');

                // Update original select
                for (let i = 0; i < selectEl.options.length; i++) {
                    if (selectEl.options[i].value === value) {
                        selectEl.selectedIndex = i;
                        const event = new Event('change', { bubbles: true });
                        selectEl.dispatchEvent(event);
                        break;
                    }
                }

                // Update UI visually
                newSelectedDiv.innerHTML = e.target.innerHTML;

                const sameAsSelected = this.parentNode.querySelectorAll('.same-as-selected');
                for (let i = 0; i < sameAsSelected.length; i++) {
                    sameAsSelected[i].classList.remove('same-as-selected');
                }
                e.target.classList.add('same-as-selected');

                // Close dropdown
                newItemsDiv.classList.add('select-hide');
                newSelectedDiv.classList.remove('select-arrow-active');
                newSelectedDiv.parentNode.style.zIndex = '1';

                if (onChangeCallback) onChangeCallback(value);
            }
        });
    }

    function closeAllCustomSelects(elmnt) {
        const x = document.getElementsByClassName("select-items");
        const y = document.getElementsByClassName("select-selected");
        const arrNo = [];

        for (let i = 0; i < y.length; i++) {
            if (elmnt === y[i]) {
                arrNo.push(i);
            } else {
                y[i].classList.remove("select-arrow-active");
            }
        }

        for (let i = 0; i < x.length; i++) {
            if (arrNo.indexOf(i) === -1) {
                x[i].classList.add("select-hide");
                if (x[i].parentNode) {
                    x[i].parentNode.style.zIndex = '1';
                }
            }
        }
    }

    document.addEventListener("click", function () {
        closeAllCustomSelects(null);
    });

    // Initialize the static custom selects
    setupCustomSelect('custom-rest-timer');

    // --- Category Filter Modal Logic ---
    const categoryFilterBtn = document.getElementById('category-filter-btn');
    const categoryFilterLabel = document.getElementById('category-filter-label');
    const categoryFilterModal = document.getElementById('category-filter-modal');
    const categoryModalClose = document.getElementById('category-modal-close');
    const categoryModalList = document.getElementById('category-modal-list');

    if (categoryFilterBtn && categoryFilterModal) {
        categoryFilterBtn.addEventListener('click', () => {
            categoryFilterModal.classList.remove('hidden');
        });

        categoryModalClose.addEventListener('click', () => {
            categoryFilterModal.classList.add('hidden');
        });

        // Close on backdrop click
        categoryFilterModal.addEventListener('click', (e) => {
            if (e.target === categoryFilterModal) {
                categoryFilterModal.classList.add('hidden');
            }
        });

        // Item selection
        categoryModalList.addEventListener('click', (e) => {
            const item = e.target.closest('.category-modal-item');
            if (!item) return;

            const value = item.getAttribute('data-value');

            // Update selected highlight
            categoryModalList.querySelectorAll('.category-modal-item').forEach(el => {
                el.classList.remove('selected');
            });
            item.classList.add('selected');

            // Update the button label
            categoryFilterLabel.textContent = item.textContent.replace('✓ ', '');

            // Update the hidden select and trigger change
            categoryFilter.value = value;
            const event = new Event('change', { bubbles: true });
            categoryFilter.dispatchEvent(event);

            // Close modal
            categoryFilterModal.classList.add('hidden');
        });
    }

    // --- Exercise Select Modal Logic ---
    const exerciseSelectBtn = document.getElementById('exercise-select-btn');
    const exerciseSelectLabelEl = document.getElementById('exercise-select-label');
    const exerciseSelectModal = document.getElementById('exercise-select-modal');
    const exerciseModalCloseBtn = document.getElementById('exercise-modal-close');
    const exerciseModalListEl = document.getElementById('exercise-modal-list');

    if (exerciseSelectBtn && exerciseSelectModal) {
        exerciseSelectBtn.addEventListener('click', () => {
            exerciseSelectModal.classList.remove('hidden');
        });

        exerciseModalCloseBtn.addEventListener('click', () => {
            exerciseSelectModal.classList.add('hidden');
        });

        // Close on backdrop click
        exerciseSelectModal.addEventListener('click', (e) => {
            if (e.target === exerciseSelectModal) {
                exerciseSelectModal.classList.add('hidden');
            }
        });

        // Item selection
        exerciseModalListEl.addEventListener('click', (e) => {
            const item = e.target.closest('.category-modal-item');
            if (!item) return;

            const value = item.getAttribute('data-value');

            // Update selected highlight
            exerciseModalListEl.querySelectorAll('.category-modal-item').forEach(el => {
                el.classList.remove('selected');
            });
            item.classList.add('selected');

            // Update the button label
            exerciseSelectLabelEl.textContent = item.textContent;

            // Update the hidden select and trigger change
            for (let i = 0; i < menuExerciseSelect.options.length; i++) {
                if (menuExerciseSelect.options[i].value === value) {
                    menuExerciseSelect.selectedIndex = i;
                    const event = new Event('change', { bubbles: true });
                    menuExerciseSelect.dispatchEvent(event);
                    break;
                }
            }

            // Close modal
            exerciseSelectModal.classList.add('hidden');
        });
    }

    // Explicitly render exercise options on start and initialize data-setup
    const currentCategory = categoryFilter ? categoryFilter.value : 'all';
    renderExerciseOptions(currentCategory);
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}
