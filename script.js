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
        benchpress: { gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', glow: 'rgba(59, 130, 246, 0.4)' },
        deadlift: { gradient: 'linear-gradient(135deg, #ef4444, #f97316)', glow: 'rgba(239, 68, 68, 0.4)' },
        squat: { gradient: 'linear-gradient(135deg, #10b981, #14b8a6)', glow: 'rgba(16, 185, 129, 0.4)' }
    };

    // Change theme based on selected exercise
    function updateTheme(exercise) {
        const theme = colors[exercise];
        document.documentElement.style.setProperty('--accent-gradient', theme.gradient);
        document.documentElement.style.setProperty('--accent-glow', theme.glow);
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
    const menuExerciseSelect = document.getElementById('menu-exercise');
    const customExerciseInput = document.getElementById('custom-exercise');
    const registrationSetsContainer = document.getElementById('registration-sets');
    const addRegSetBtn = document.getElementById('add-reg-set-btn');
    const addMenuBtn = document.getElementById('add-menu-btn');
    const workoutMenuList = document.getElementById('workout-menu-list');
    const saveMenuBtn = document.getElementById('save-menu-btn');
    const clearMenuBtn = document.getElementById('clear-menu-btn');

    // Copy Feature Elements
    const copyDateSelect = document.getElementById('copy-date-select');
    const copyMenuBtn = document.getElementById('copy-menu-btn');

    let currentRegistrationSets = [{ weight: '', reps: '', completed: false }];

    // Initialize Date Input with Today's Date
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    workoutDateInput.value = todayStr;

    // Load entire history from localStorage
    // New Structure: { "2023-10-25": [{exercise: "...", sets: [{weight: 80, reps: 10, completed: false}, ...]}, ...], ... }
    let workoutHistory = JSON.parse(localStorage.getItem('workoutHistory')) || {};

    // Legacy migration (if users have the old 'workoutHistory' or 'workoutMenu' array formats)
    const oldMenu = localStorage.getItem('workoutMenu');
    if (oldMenu && !workoutHistory[todayStr]) {
        const parsedOld = JSON.parse(oldMenu);
        // convert to new format
        workoutHistory[todayStr] = parsedOld.map(item => {
            if (item.sets && Array.isArray(item.sets)) return item; // already new format

            // convert legacy old format (weight, reps, sets as numbers)
            let newSets = [];
            for (let i = 0; i < (item.sets || 1); i++) {
                newSets.push({ weight: item.weight || 0, reps: item.reps || 0, completed: false });
            }
            return { exercise: item.exercise, sets: newSets };
        });
        localStorage.removeItem('workoutMenu');
        saveHistory();
    } else {
        // migrate existing workoutHistory if they are still in old format
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
    }

    // Refresh Title
    function updateListTitle() {
        const selectedDate = getCurrentDate();
        if (selectedDate === todayStr) {
            menuListTitle.textContent = "今日のメニュー";
        } else {
            const [y, m, d] = selectedDate.split('-');
            menuListTitle.textContent = `${y}年${parseInt(m)}月${parseInt(d)}日のメニュー`;
        }
    }

    // Update Copy Date Options
    function updateCopyDateOptions() {
        const currentDate = getCurrentDate();
        const dates = Object.keys(workoutHistory)
            .filter(date => date !== currentDate && workoutHistory[date].length > 0)
            .sort((a, b) => new Date(b) - new Date(a)); // sort descending

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

    // "Other" exercise input toggle
    menuExerciseSelect.addEventListener('change', (e) => {
        if (e.target.value === 'その他（自由入力）') {
            customExerciseInput.classList.remove('hidden');
            customExerciseInput.focus();
        } else {
            customExerciseInput.classList.add('hidden');
            customExerciseInput.value = '';
        }
    });

    function renderRegistrationSets() {
        registrationSetsContainer.innerHTML = '';
        currentRegistrationSets.forEach((set, index) => {
            const isCompleted = set.completed ? 'completed' : '';
            const isChecked = set.completed ? 'checked' : '';

            const rowHtml = `
                <div class="set-row ${isCompleted}" data-reg-idx="${index}">
                    <span class="set-number">${index + 1}</span>
                    <div class="grid-input-wrapper">
                        <input type="number" class="mini-input reg-set-weight" value="${set.weight}" min="0" step="0.5">
                    </div>
                    <div class="grid-input-wrapper">
                        <input type="number" class="mini-input reg-set-reps" value="${set.reps}" min="0" step="1">
                    </div>
                    <div class="grid-checkbox-wrapper">
                        <input type="checkbox" class="reg-set-checkbox" ${isChecked} title="完了">
                    </div>
                    <button class="remove-reg-set-btn remove-set-btn" title="セット削除">×</button>
                </div>
            `;
            registrationSetsContainer.insertAdjacentHTML('beforeend', rowHtml);
        });

        document.querySelectorAll('.reg-set-weight, .reg-set-reps').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = parseInt(e.currentTarget.closest('.set-row').getAttribute('data-reg-idx'), 10);
                if (e.currentTarget.classList.contains('reg-set-weight')) {
                    currentRegistrationSets[idx].weight = e.currentTarget.value;
                } else {
                    currentRegistrationSets[idx].reps = e.currentTarget.value;
                }
            });
        });

        document.querySelectorAll('.reg-set-checkbox').forEach(input => {
            input.addEventListener('change', (e) => {
                const row = e.currentTarget.closest('.set-row');
                const idx = parseInt(row.getAttribute('data-reg-idx'), 10);
                currentRegistrationSets[idx].completed = e.currentTarget.checked;
                if (e.currentTarget.checked) row.classList.add('completed');
                else row.classList.remove('completed');
            });
        });

        document.querySelectorAll('.remove-reg-set-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.closest('.set-row').getAttribute('data-reg-idx'), 10);
                currentRegistrationSets.splice(idx, 1);
                if (currentRegistrationSets.length === 0) {
                    currentRegistrationSets.push({ weight: '', reps: '', completed: false });
                }
                renderRegistrationSets();
            });
        });
    }

    addRegSetBtn.addEventListener('click', () => {
        let newWeight = '', newReps = '';
        if (currentRegistrationSets.length > 0) {
            const last = currentRegistrationSets[currentRegistrationSets.length - 1];
            newWeight = last.weight;
            newReps = last.reps;
        }
        currentRegistrationSets.push({ weight: newWeight, reps: newReps, completed: false });
        renderRegistrationSets();
    });

    // Initial render for registration sets
    renderRegistrationSets();

    // The saveMenu function is no longer used as workoutHistory is directly managed.
    // function saveMenu() {
    //     localStorage.setItem('workoutMenu', JSON.stringify(workoutMenu));
    // }

    function renderMenu() {
        updateListTitle();
        updateCopyDateOptions();

        if (typeof updateMaxRecords === 'function') {
            const currentEx = document.querySelector('input[name="exercise"]:checked').value;
            updateMaxRecords(currentEx);
        }

        workoutMenuList.innerHTML = '';
        const dailyMenu = getDailyMenu();

        if (dailyMenu.length === 0) {
            workoutMenuList.innerHTML = '<li class="empty-message">メニューが登録されていません</li>';
            return;
        }

        dailyMenu.forEach((item, exerciseIndex) => {
            const li = document.createElement('li');
            li.className = 'menu-item';
            li.style.flexDirection = 'column';
            li.style.alignItems = 'stretch';

            // Generate set rows HTML
            let setsHtml = '';
            item.sets.forEach((set, setIndex) => {
                const isCompleted = set.completed ? 'completed' : '';
                const isChecked = set.completed ? 'checked' : '';

                setsHtml += `
                    <div class="set-row ${isCompleted}" data-ex-idx="${exerciseIndex}" data-set-idx="${setIndex}">
                        <span class="set-number">${setIndex + 1}</span>
                        <div class="grid-input-wrapper">
                            <input type="number" class="mini-input set-weight" value="${set.weight}" min="0" step="0.5">
                        </div>
                        <div class="grid-input-wrapper">
                            <input type="number" class="mini-input set-reps" value="${set.reps}" min="0" step="1">
                        </div>
                        <div class="grid-checkbox-wrapper">
                            <input type="checkbox" class="set-checkbox" ${isChecked} title="完了">
                        </div>
                        <button class="remove-set-btn" title="セット削除">×</button>
                    </div>
                `;
            });

            li.innerHTML = `
                <div class="menu-header">
                    <span class="title">${item.exercise}</span>
                    <button class="delete-exercise-btn" data-index="${exerciseIndex}" title="種目削除">🗑️</button>
                </div>
                <div class="set-header-row" style="margin-bottom: 0.2rem;">
                    <span>セット</span>
                    <span>kg</span>
                    <span>回</span>
                    <span>完了</span>
                    <span></span>
                </div>
                <div class="sets-container">
                    ${setsHtml}
                </div>
                <button class="add-set-btn" data-index="${exerciseIndex}">+ セットを追加</button>
            `;

            workoutMenuList.appendChild(li);
        });

        // Add event listeners for the new dynamic elements
        attachMenuEventListeners();
    }

    function attachMenuEventListeners() {
        // Delete Exercise
        document.querySelectorAll('.delete-exercise-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                const date = getCurrentDate();
                if (confirm('この種目とすべてのセットを削除しますか？')) {
                    workoutHistory[date].splice(idx, 1);
                    if (workoutHistory[date].length === 0) delete workoutHistory[date];
                    saveHistory();
                    renderMenu();
                }
            });
        });

        // Add Set
        document.querySelectorAll('.add-set-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const exIdx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                const date = getCurrentDate();
                const sets = workoutHistory[date][exIdx].sets;

                // Copy properties from the last set if available
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

        // Remove Set
        document.querySelectorAll('.remove-set-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const row = e.currentTarget.closest('.set-row');
                const exIdx = parseInt(row.getAttribute('data-ex-idx'), 10);
                const setIdx = parseInt(row.getAttribute('data-set-idx'), 10);
                const date = getCurrentDate();

                workoutHistory[date][exIdx].sets.splice(setIdx, 1);

                // if no sets left, remove the exercise completely
                if (workoutHistory[date][exIdx].sets.length === 0) {
                    workoutHistory[date].splice(exIdx, 1);
                    if (workoutHistory[date].length === 0) delete workoutHistory[date];
                }

                saveHistory();
                renderMenu();
            });
        });

        // Input Changes (Weight & Reps)
        document.querySelectorAll('.set-weight, .set-reps').forEach(input => {
            input.addEventListener('change', (e) => {
                const row = e.currentTarget.closest('.set-row');
                const exIdx = parseInt(row.getAttribute('data-ex-idx'), 10);
                const setIdx = parseInt(row.getAttribute('data-set-idx'), 10);
                const date = getCurrentDate();

                const targetSet = workoutHistory[date][exIdx].sets[setIdx];

                if (e.currentTarget.classList.contains('set-weight')) {
                    targetSet.weight = parseFloat(e.currentTarget.value) || 0;
                } else {
                    targetSet.reps = parseInt(e.currentTarget.value, 10) || 0;
                }

                saveHistory();
            });
        });

        // Checkbox Changes
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
                } else {
                    row.classList.remove('completed');
                }

                saveHistory();
            });
        });
    }

    workoutDateInput.addEventListener('change', () => {
        renderMenu();
    });

    addMenuBtn.addEventListener('click', () => {
        let exercise = menuExerciseSelect.value;
        if (exercise === 'その他（自由入力）') {
            exercise = customExerciseInput.value.trim();
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

        const setsToSave = currentRegistrationSets.map(set => ({
            weight: parseFloat(set.weight) || 0,
            reps: parseInt(set.reps, 10) || 0,
            completed: set.completed
        }));

        workoutHistory[date].push({
            exercise: exercise,
            sets: setsToSave
        });

        saveHistory();
        renderMenu();

        // Clear and Reset Form
        menuExerciseSelect.selectedIndex = 0;
        customExerciseInput.classList.add('hidden');
        customExerciseInput.value = '';

        currentRegistrationSets = [{ weight: '', reps: '', completed: false }];
        renderRegistrationSets();
    });

        // --- ここから追加・修正（シェア機能） ---
    async function shareWorkoutToGemini() {
        const date = getCurrentDate();
        const dailyMenu = workoutHistory[date];

        if (!dailyMenu || dailyMenu.length === 0) {
            return; // シェアするメニューがない場合は何もしない
        }

        // Geminiに送るためのテキストを自動作成する
        let workoutText = `【${date} の筋トレ記録】\n\n`;

        dailyMenu.forEach(item => {
            workoutText += `種目：${item.exercise}\n`;
            item.sets.forEach((set, index) => {
                // 完了にチェックが入っているかどうかも判定できます（不要なら消してもOK）
                const status = set.completed ? '完了' : '未完了';
                workoutText += `・${index + 1}セット：${set.weight}kg × ${set.reps}回\n`;
            });
            workoutText += '\n';
        });

        workoutText += `このトレーニングメニューのボリュームや、次回の重量設定について、AIパーソナルトレーナーとしてアドバイスをお願いします！`;

        // スマホのシェア画面を呼び出す
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
        saveHistory();
        
        // 保存処理の直後に、上で作ったシェア機能を呼び出す！
        shareWorkoutToGemini();

        const originalText = saveMenuBtn.textContent;
        saveMenuBtn.textContent = '保存しました！ ✓';
        saveMenuBtn.style.background = '#10b981';
        saveMenuBtn.style.color = '#ffffff';
        setTimeout(() => {
            saveMenuBtn.textContent = originalText;
            saveMenuBtn.style.background = '';
            saveMenuBtn.style.color = '';
        }, 2000);
    });
    // --- ここまで ---
    clearMenuBtn.addEventListener('click', () => {
        const date = getCurrentDate();
        const displayDate = date === todayStr ? '今日' : 'この日';

        if (confirm(`${displayDate}のメニューを全て削除しますか？`)) {
            delete workoutHistory[date];
            saveHistory();
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

        // Deep copy the menu and reset completion status
        const copiedMenu = JSON.parse(JSON.stringify(sourceMenu));
        copiedMenu.forEach(item => {
            item.sets.forEach(set => {
                set.completed = false; // Reset checkmarks
            });
        });

        workoutHistory[targetDate].push(...copiedMenu);
        saveHistory();
        renderMenu();

        // Visual feedback
        const originalText = copyMenuBtn.textContent;
        copyMenuBtn.textContent = 'コピー完了！';
        copyMenuBtn.style.background = '#10b981';
        copyMenuBtn.style.color = 'white';
        setTimeout(() => {
            copyMenuBtn.textContent = originalText;
            copyMenuBtn.style.background = '';
            copyMenuBtn.style.color = '';
        }, 2000);
    });

    // Max calculation logic
    const exerciseNamesMap = {
        'benchpress': 'ベンチプレス',
        'deadlift': 'デッドリフト',
        'squat': 'スクワット'
    };

    function updateMaxRecords(exerciseKey) {
        if (typeof workoutHistory === 'undefined' || !workoutHistory) return;

        const targetExerciseName = exerciseNamesMap[exerciseKey];
        if (!targetExerciseName) return;

        recordExerciseName.textContent = targetExerciseName;

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

    // Initial render
    renderRegistrationSets();
    renderMenu();
    updateMaxRecords(document.querySelector('input[name="exercise"]:checked').value);
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
