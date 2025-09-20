class StudentView {
    /* แสดงข้อความแจ้งเตือน
       - {string} message - ข้อความ
       - {string} type - ประเภท (success, error, warning)
    */
    showAlert(message, type = 'success') {
        const alertContainer = document.getElementById('alert-container');
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;

        alertContainer.innerHTML = '';
        alertContainer.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    /* แสดงหน้าเข้าสู่ระบบ */

    showLogin() {
        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('main-content').classList.add('hidden');
    }

    /* แสดงเนื้อหาหลักหลังเข้าสู่ระบบ
       - {Object} user - ข้อมูลผู้ใช้
       - {boolean} isAdmin - เป็นแอดมินหรือไม่
     */

    showMainContent(user, isAdmin = false) {
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('main-content').classList.remove('hidden');

        // แสดงข้อมูลผู้ใช้
        const userInfoDiv = document.getElementById('user-info');
        userInfoDiv.classList.remove('hidden');

        if (isAdmin) {
            userInfoDiv.innerHTML = `
                <h3>👨‍💼 ผู้ดูแลระบบ</h3>
                <p>สถานะ: แอดมิน</p>
            `;
            document.getElementById('btn-admin').classList.remove('hidden');
            document.getElementById('btn-subjects').classList.add('hidden');
            document.getElementById('btn-profile').classList.add('hidden');
        } else {
            userInfoDiv.innerHTML = `
                <h3>👤 ${user.prefix}${user.firstName} ${user.lastName}</h3>
                <p><strong>รหัสนักเรียน:</strong> ${user.id}</p>
                <p><strong>โรงเรียน:</strong> ${user.school}</p>
                <p><strong>อีเมล:</strong> ${user.email}</p>
            `;
            document.getElementById('btn-admin').classList.add('hidden');
            document.getElementById('btn-subjects').classList.remove('hidden');
            document.getElementById('btn-profile').classList.remove('hidden');
        }
    }

    /* แสดงรายการวิชาสำหรับลงทะเบียน
       - {Array} subjects - รายการวิชา
       - {string} studentId - รหัสนักเรียน
       - {StudentModel} studentModel - Model นักเรียน
       - {SubjectModel} subjectModel - Model วิชา
    */

    showSubjects(subjects, studentId, studentModel, subjectModel) {
        this.hideAllViews();
        document.getElementById('subject-registration').classList.remove('hidden');

        const subjectsList = document.getElementById('subjects-list');
        subjectsList.innerHTML = '';

        subjects.forEach(subject => {
            const enrollmentCheck = subjectModel.canEnroll(subject.id, studentId, studentModel);

            const subjectCard = document.createElement('div');
            subjectCard.className = 'subject-card';

            let statusBadge = '';
            let enrollButton = '';

            // สร้าง Status Badge
            if (subject.maxStudents === -1) {
                statusBadge = '<span class="status-badge status-unlimited">ไม่จำกัดจำนวน</span>';
            } else if (subject.currentEnrolled >= subject.maxStudents) {
                statusBadge = '<span class="status-badge status-full">เต็มแล้ว</span>';
            } else {
                statusBadge = `<span class="status-badge status-available">เหลือที่นั่ง ${subject.maxStudents - subject.currentEnrolled} ที่</span>`;
            }

            // สร้างปุ่มลงทะเบียน
            if (enrollmentCheck.canEnroll) {
                enrollButton = `<button onclick="app.controller.enrollSubject('${subject.id}')">ลงทะเบียน</button>`;
            } else {
                enrollButton = `<button disabled>ไม่สามารถลงทะเบียนได้</button>`;
            }

            // แสดงข้อมูลวิชาบังคับก่อน
            const prerequisiteInfo = subject.prerequisite ?
                `<div class="prerequisite-info">📋 วิชาบังคับก่อน: ${subjectModel.getSubject(subject.prerequisite)?.name || subject.prerequisite}</div>` : '';

            subjectCard.innerHTML = `
                <div class="subject-code">${subject.id}</div>
                <div class="subject-name">${subject.name}</div>
                <div class="subject-info">
                    👨‍🏫 อาจารย์: ${subject.instructor}<br>
                    📚 หน่วยกิต: ${subject.credits}<br>
                    👥 จำนวนผู้ลงทะเบียน: ${subject.currentEnrolled}${subject.maxStudents !== -1 ? '/' + subject.maxStudents : ''}
                </div>
                ${prerequisiteInfo}
                ${statusBadge}
                <div style="margin-top: 15px;">
                    <button onclick="app.controller.showSubjectDetail('${subject.id}')">ดูรายละเอียด</button>
                    ${enrollButton}
                </div>
                ${!enrollmentCheck.canEnroll ? `<div style="color: #dc3545; margin-top: 10px; font-size: 14px;">❌ ${enrollmentCheck.reason}</div>` : ''}
            `;

            subjectsList.appendChild(subjectCard);
        });
    }

    /* แสดงรายละเอียดวิชา
      - {Object} subject - ข้อมูลวิชา
      - {string} studentId - รหัสนักเรียน
      - {StudentModel} studentModel - Model นักเรียน
      - {SubjectModel} subjectModel - Model วิชา
    */

    showSubjectDetail(subject, studentId, studentModel, subjectModel) {
        this.hideAllViews();
        document.getElementById('subject-detail').classList.remove('hidden');

        const enrollmentCheck = subjectModel.canEnroll(subject.id, studentId, studentModel);

        // สร้างข้อมูลจำนวนคน
        let statusInfo = '';
        if (subject.maxStudents === -1) {
            statusInfo = `
                <p><strong>จำนวนคนสูงสุด:</strong> ไม่จำกัด</p>
                <p><strong>จำนวนปัจจุบัน:</strong> ${subject.currentEnrolled} คน</p>
            `;
        } else {
            statusInfo = `
                <p><strong>จำนวนคนสูงสุด:</strong> ${subject.maxStudents} คน</p>
                <p><strong>จำนวนปัจจุบัน:</strong> ${subject.currentEnrolled} คน</p>
                <p><strong>ที่นั่งว่าง:</strong> ${subject.maxStudents - subject.currentEnrolled} คน</p>
            `;
        }

        // แสดงข้อมูลวิชาบังคับก่อน
        const prerequisiteInfo = subject.prerequisite ?
            `<p><strong>วิชาบังคับก่อน:</strong> ${subjectModel.getSubject(subject.prerequisite)?.name || subject.prerequisite}</p>` :
            '<p><strong>วิชาบังคับก่อน:</strong> ไม่มี</p>';

        // สร้างปุ่มลงทะเบียน
        let enrollButton = '';
        if (enrollmentCheck.canEnroll) {
            enrollButton = `<button onclick="app.controller.enrollSubject('${subject.id}')">ลงทะเบียนวิชานี้</button>`;
        } else {
            enrollButton = `<button disabled>ไม่สามารถลงทะเบียนได้</button>`;
        }

        document.getElementById('subject-detail-content').innerHTML = `
            <div class="subject-card">
                <h3>${subject.id} - ${subject.name}</h3>
                <p><strong>อาจารย์ผู้สอน:</strong> ${subject.instructor}</p>
                <p><strong>หน่วยกิต:</strong> ${subject.credits}</p>
                ${prerequisiteInfo}
                ${statusInfo}
                <div style="margin-top: 20px;">
                    <button onclick="app.controller.showSubjectRegistration()">← กลับหน้าลงทะเบียน</button>
                    ${enrollButton}
                </div>
                ${!enrollmentCheck.canEnroll ? `<div style="color: #dc3545; margin-top: 10px;">❌ ${enrollmentCheck.reason}</div>` : ''}
            </div>
        `;
    }

    /* แสดงข้อมูลประวัตินักเรียน
       - {Object} student - ข้อมูลนักเรียน
       - {Array} registrations - รายการวิชาที่ลงทะเบียน
       - {Array} subjects - รายการวิชาทั้งหมด
       - {SubjectModel} subjectModel - Model วิชา
       - {StudentModel} studentModel - Model นักเรียน
    */

    showStudentProfile(student, registrations, subjects, subjectModel, studentModel) {
        this.hideAllViews();
        document.getElementById('student-profile').classList.remove('hidden');

        let registeredSubjectsHtml = '';
        let totalCredits = 0;

        // สร้างตารางวิชาที่ลงทะเบียน
        if (registrations.length > 0) {
            registrations.forEach(subjectId => {
                const subject = subjects.find(s => s.id === subjectId);
                if (subject) {
                    const grade = student.grades[subjectId] || 'ยังไม่มีเกรด';
                    registeredSubjectsHtml += `
                        <tr>
                            <td>${subject.id}</td>
                            <td>${subject.name}</td>
                            <td>${subject.credits}</td>
                            <td>${subject.instructor}</td>
                            <td>${grade}</td>
                            <td>
                                <button onclick="app.controller.withdrawSubject('${subject.id}')" 
                                        style="background: #dc3545; font-size: 12px; padding: 5px 10px;">
                                    ถอน
                                </button>
                            </td>
                        </tr>
                    `;
                    totalCredits += subject.credits;
                }
            });
        } else {
            registeredSubjectsHtml = '<tr><td colspan="6" style="text-align: center;">ยังไม่ได้ลงทะเบียนวิชาใดๆ</td></tr>';
        }

        // สร้างตารางประวัติเกรด
        let gradesHtml = '';
        if (student.grades && Object.keys(student.grades).length > 0) {
            Object.keys(student.grades).forEach(subjectId => {
                const subject = subjects.find(s => s.id === subjectId);
                if (subject) {
                    gradesHtml += `
                        <tr>
                            <td>${subject.id}</td>
                            <td>${subject.name}</td>
                            <td>${subject.credits}</td>
                            <td>${student.grades[subjectId]}</td>
                        </tr>
                    `;
                }
            });
        } else {
            gradesHtml = '<tr><td colspan="4" style="text-align: center;">ยังไม่มีเกรด</td></tr>';
        }

        document.getElementById('student-profile-content').innerHTML = `
            <div class="subject-card">
                <h3>ข้อมูลส่วนตัว</h3>
                <p><strong>รหัสนักเรียน:</strong> ${student.id}</p>
                <p><strong>ชื่อ-นามสกุล:</strong> ${student.prefix}${student.firstName} ${student.lastName}</p>
                <p><strong>วันเกิด:</strong> ${new Date(student.birthDate).toLocaleDateString('th-TH')}</p>
                <p><strong>โรงเรียนปัจจุบัน:</strong> ${student.school}</p>
                <p><strong>อีเมล:</strong> ${student.email}</p>
                <p><strong>อายุ:</strong> ${this.calculateAge(student.birthDate)} ปี</p>
            </div>

            <div class="subject-card">
                <h3>รายวิชาที่ลงทะเบียนในเทอมนี้</h3>
                <p><strong>จำนวนหน่วยกิตรวม:</strong> ${totalCredits} หน่วยกิต</p>
                <table>
                    <thead>
                        <tr>
                            <th>รหัสวิชา</th>
                            <th>ชื่อวิชา</th>
                            <th>หน่วยกิต</th>
                            <th>อาจารย์</th>
                            <th>เกรด</th>
                            <th>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${registeredSubjectsHtml}
                    </tbody>
                </table>
            </div>

            <div class="subject-card">
                <h3>ประวัติเกรด</h3>
                <table>
                    <thead>
                        <tr>
                            <th>รหัสวิชา</th>
                            <th>ชื่อวิชา</th>
                            <th>หน่วยกิต</th>
                            <th>เกรด</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${gradesHtml}
                    </tbody>
                </table>
            </div>
        `;
    }

    /* แสดงหน้าจัดการระบบสำหรับแอดมิน
       - {Array} students - รายชื่อนักเรียนทั้งหมด
       - {Array} subjects - รายการวิชาทั้งหมด
       - {StudentModel} studentModel - Model นักเรียน
       - {SubjectModel} subjectModel - Model วิชา
    */

    showAdminPanel(students, subjects, studentModel, subjectModel) {
        this.hideAllViews();
        document.getElementById('admin-panel').classList.remove('hidden');

        // สร้างตารางนักเรียน
        let studentsListHtml = '';
        students.forEach(student => {
            const registrations = studentModel.getStudentRegistrations(student.id);
            const registeredSubjects = registrations.map(subjectId => {
                const subject = subjects.find(s => s.id === subjectId);
                return subject ? subject.name : subjectId;
            }).join(', ') || 'ไม่มี';

            studentsListHtml += `
                <tr>
                    <td>${student.id}</td>
                    <td>${student.prefix}${student.firstName} ${student.lastName}</td>
                    <td>${student.school}</td>
                    <td>${registrations.length}</td>
                    <td style="font-size: 12px;">${registeredSubjects}</td>
                </tr>
            `;
        });

        // สร้างตารางสถิติวิชา
        let subjectsListHtml = '';
        subjects.forEach(subject => {
            subjectsListHtml += `
                <tr>
                    <td>${subject.id}</td>
                    <td>${subject.name}</td>
                    <td>${subject.credits}</td>
                    <td>${subject.instructor}</td>
                    <td>${subject.currentEnrolled}</td>
                    <td>${subject.maxStudents === -1 ? 'ไม่จำกัด' : subject.maxStudents}</td>
                </tr>
            `;
        });

        // สร้างตารางจัดการเกรด
        let gradeManagementHtml = '';
        students.forEach(student => {
            const registrations = studentModel.getStudentRegistrations(student.id);
            registrations.forEach(subjectId => {
                const subject = subjects.find(s => s.id === subjectId);
                if (subject) {
                    const currentGrade = student.grades[subjectId] || '';
                    gradeManagementHtml += `
                        <tr>
                            <td>${student.id}</td>
                            <td>${student.firstName} ${student.lastName}</td>
                            <td>${subject.id}</td>
                            <td>${subject.name}</td>
                            <td>
                                <select id="grade-${student.id}-${subject.id}" class="grade-input">
                                    <option value="">-</option>
                                    <option value="A" ${currentGrade === 'A' ? 'selected' : ''}>A</option>
                                    <option value="B+" ${currentGrade === 'B+' ? 'selected' : ''}>B+</option>
                                    <option value="B" ${currentGrade === 'B' ? 'selected' : ''}>B</option>
                                    <option value="C+" ${currentGrade === 'C+' ? 'selected' : ''}>C+</option>
                                    <option value="C" ${currentGrade === 'C' ? 'selected' : ''}>C</option>
                                    <option value="D+" ${currentGrade === 'D+' ? 'selected' : ''}>D+</option>
                                    <option value="D" ${currentGrade === 'D' ? 'selected' : ''}>D</option>
                                    <option value="F" ${currentGrade === 'F' ? 'selected' : ''}>F</option>
                                </select>
                                <button onclick="app.controller.updateGrade('${student.id}', '${subject.id}')" 
                                        style="margin-left: 5px; font-size: 12px; padding: 5px 10px;">
                                    บันทึก
                                </button>
                            </td>
                        </tr>
                    `;
                }
            });
        });

        if (!gradeManagementHtml) {
            gradeManagementHtml = '<tr><td colspan="5" style="text-align: center;">ไม่มีการลงทะเบียนในระบบ</td></tr>';
        }

        document.getElementById('admin-content').innerHTML = `
            <div class="subject-card">
                <h3>รายชื่อนักเรียนทั้งหมด</h3>
                <table>
                    <thead>
                        <tr>
                            <th>รหัสนักเรียน</th>
                            <th>ชื่อ-นามสกุล</th>
                            <th>โรงเรียน</th>
                            <th>จำนวนวิชาที่ลงทะเบียน</th>
                            <th>รายวิชาที่ลงทะเบียน</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${studentsListHtml}
                    </tbody>
                </table>
            </div>

            <div class="subject-card">
                <h3>สถิติการลงทะเบียนรายวิชา</h3>
                <table>
                    <thead>
                        <tr>
                            <th>รหัสวิชา</th>
                            <th>ชื่อวิชา</th>
                            <th>หน่วยกิต</th>
                            <th>อาจารย์</th>
                            <th>ลงทะเบียนแล้ว</th>
                            <th>จำนวนสูงสุด</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${subjectsListHtml}
                    </tbody>
                </table>
            </div>

            <div class="subject-card">
                <h3>จัดการเกรด</h3>
                <table>
                    <thead>
                        <tr>
                            <th>รหัสนักเรียน</th>
                            <th>ชื่อนักเรียน</th>
                            <th>รหัสวิชา</th>
                            <th>ชื่อวิชา</th>
                            <th>เกรด</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${gradeManagementHtml}
                    </tbody>
                </table>
            </div>
        `;
    }

    // ซ่อน View ทั้งหมด //
    hideAllViews() {
        document.getElementById('subject-registration').classList.add('hidden');
        document.getElementById('subject-detail').classList.add('hidden');
        document.getElementById('student-profile').classList.add('hidden');
        document.getElementById('admin-panel').classList.add('hidden');
    }

    /* คำนวณอายุจากวันเกิด
       - {string} birthDate - วันเกิดในรูปแบบ YYYY-MM-DD
       - {number} - อายุเป็นปี
    */

    calculateAge(birthDate) {
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }

    // ล้างข้อความแจ้งเตือนการเข้าสู่ระบบ
    clearLoginMessage() {
        document.getElementById('login-message').innerHTML = '';
    }

    /* แสดงข้อผิดพลาดการเข้าสู่ระบบ
       - {string} message - ข้อความแจ้งข้อผิดพลาด
    */

    showLoginError(message) {
        document.getElementById('login-message').innerHTML = `
            <div class="alert alert-error" style="margin-top: 10px;">${message}</div>
        `;
    }

    /* อัพเดทข้อมูลจำนวนคนลงทะเบียนใน UI
       - {string} subjectId - รหัสวิชา
       - {number} currentEnrolled - จำนวนคนปัจจุบัน
       - {number} maxStudents - จำนวนคนสูงสุด
    */

    updateEnrollmentCount(subjectId, currentEnrolled, maxStudents) {
        // อัพเดท UI ตรงส่วนที่แสดงจำนวนคนลงทะเบียน
        // ฟังก์ชันนี้สามารถใช้เพื่ออัพเดท UI แบบ real-time
        const elements = document.querySelectorAll(`[data-subject-id="${subjectId}"]`);
        elements.forEach(element => {
            const enrollmentText = maxStudents === -1 ?
                `จำนวนผู้ลงทะเบียน: ${currentEnrolled}` :
                `จำนวนผู้ลงทะเบียน: ${currentEnrolled}/${maxStudents}`;

            const enrollmentSpan = element.querySelector('.enrollment-count');
            if (enrollmentSpan) {
                enrollmentSpan.textContent = enrollmentText;
            }
        });
    }

    /* แสดงข้อความยืนยันการดำเนินการ
       - {string} message - ข้อความยืนยัน
       - {boolean} - ผลการยืนยัน
    */

    showConfirmation(message) {
        return confirm(message);
    }

    /* แสดงข้อมูลการโหลด
       - {boolean} show - แสดงหรือซ่อน
     */

    showLoading(show = true) {
        // สามารถเพิ่ม loading spinner ได้ตรงนี้
        if (show) {
            document.body.style.cursor = 'wait';
        } else {
            document.body.style.cursor = 'default';
        }
    }

    /* เน้นสี element ที่เพิ่งถูกอัพเดท
       - {string} elementId - ID ของ element
     */

    highlightUpdatedElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.backgroundColor = '#fff3cd';
            setTimeout(() => {
                element.style.backgroundColor = '';
            }, 2000);
        }
    }

    /* สร้าง HTML สำหรับ Status Badge
       - {Object} subject - ข้อมูลวิชา
       - {string} - HTML ของ Status Badge
    */

    createStatusBadge(subject) {
        if (subject.maxStudents === -1) {
            return '<span class="status-badge status-unlimited">ไม่จำกัดจำนวน</span>';
        } else if (subject.currentEnrolled >= subject.maxStudents) {
            return '<span class="status-badge status-full">เต็มแล้ว</span>';
        } else {
            return `<span class="status-badge status-available">เหลือที่นั่ง ${subject.maxStudents - subject.currentEnrolled} ที่</span>`;
        }
    }

    /* ฟอร์แมทวันที่เป็นภาษาไทย
       - {string} dateString - วันที่ในรูปแบบ YYYY-MM-DD
       - {string} - วันที่ในรูปแบบภาษาไทย
     */

    formatThaiDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}