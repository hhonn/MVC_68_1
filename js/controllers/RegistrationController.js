class RegistrationController {
    constructor() {
        this.studentModel = new StudentModel();
        this.subjectModel = new SubjectModel();
        this.view = new StudentView();
        this.currentUser = null;
        this.isAdmin = false;

        this.initializeEventListeners();
    }

    // เริ่มต้น Event Listeners
    initializeEventListeners() {
        // Enter key สำหรับ login
        document.addEventListener('DOMContentLoaded', () => {
            const passwordInput = document.getElementById('login-password');
            if (passwordInput) {
                passwordInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.login();
                    }
                });
            }

            const idInput = document.getElementById('login-id');
            if (idInput) {
                idInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.login();
                    }
                });
            }
        });
    }

    // ฟังก์ชันเข้าสู่ระบบ
    login() {
        const id = document.getElementById('login-id').value.trim();
        const password = document.getElementById('login-password').value.trim();

        this.view.clearLoginMessage();

        // ตรวจสอบข้อมูลที่กรอก
        if (!id || !password) {
            this.view.showLoginError('กรุณากรอกรหัสและรหัสผ่าน');
            return;
        }

        // ตรวจสอบแอดมิน
        if (id === 'admin' && password === 'admin123') {
            this.isAdmin = true;
            this.currentUser = { id: 'admin', name: 'Administrator' };
            this.view.showMainContent(this.currentUser, true);
            this.showAdminPanel();
            return;
        }

        // ตรวจสอบนักเรียน
        const student = this.studentModel.getStudent(id);
        if (student && password === '123456') { // รหัสผ่านเดียวกันสำหรับทุกคน (สำหรับการทดสอบ)
            this.isAdmin = false;
            this.currentUser = student;
            this.view.showMainContent(student, false);
            this.showSubjectRegistration();
        } else {
            this.view.showLoginError('รหัสนักเรียนหรือรหัสผ่านไม่ถูกต้อง');
        }
    }

    // ฟังก์ชันออกจากระบบ
    logout() {
        this.currentUser = null;
        this.isAdmin = false;

        // ล้างข้อมูลในฟอร์ม
        document.getElementById('login-id').value = '';
        document.getElementById('login-password').value = '';

        this.view.showLogin();
    }

    // แสดงหน้าลงทะเบียนเรียน
    showSubjectRegistration() {
        if (!this.currentUser || this.isAdmin) return;

        const subjects = this.subjectModel.getAllSubjects();
        this.view.showSubjects(subjects, this.currentUser.id, this.studentModel, this.subjectModel);
    }

    /* แสดงรายละเอียดวิชา
       - {string} subjectId - รหัสวิชา
    */
    showSubjectDetail(subjectId) {
        if (!this.currentUser || this.isAdmin) return;

        const subject = this.subjectModel.getSubject(subjectId);
        if (subject) {
            this.view.showSubjectDetail(subject, this.currentUser.id, this.studentModel, this.subjectModel);
        }
    }

    // แสดงข้อมูลประวัตินักเรียน
    showStudentProfile() {
        if (!this.currentUser || this.isAdmin) return;

        const registrations = this.studentModel.getStudentRegistrations(this.currentUser.id);
        const subjects = this.subjectModel.getAllSubjects();
        this.view.showStudentProfile(this.currentUser, registrations, subjects, this.subjectModel, this.studentModel);
    }

    // แสดงหน้าจัดการระบบ (สำหรับแอดมิน)
    showAdminPanel() {
        if (!this.isAdmin) return;

        const students = this.studentModel.getAllStudents();
        const subjects = this.subjectModel.getAllSubjects();
        this.view.showAdminPanel(students, subjects, this.studentModel, this.subjectModel);
    }

    /* ลงทะเบียนวิชา
       - {string} subjectId - รหัสวิชา
    */

    enrollSubject(subjectId) {
        if (!this.currentUser || this.isAdmin) return;

        // ตรวจสอบเงื่อนไขการลงทะเบียน
        const enrollmentCheck = this.subjectModel.canEnroll(subjectId, this.currentUser.id, this.studentModel);

        if (enrollmentCheck.canEnroll) {
            // เพิ่มการลงทะเบียนในข้อมูลนักเรียน
            if (this.studentModel.addRegistration(this.currentUser.id, subjectId)) {
                // เพิ่มจำนวนคนที่ลงทะเบียนในวิชา
                if (this.subjectModel.enrollStudent(subjectId)) {
                    const subject = this.subjectModel.getSubject(subjectId);
                    this.view.showAlert(`ลงทะเบียนวิชา "${subject.name}" สำเร็จ!`, 'success');

                    // Business Rule: กลับไปหน้าประวัตินักเรียนเมื่อลงทะเบียนสำเร็จ
                    setTimeout(() => {
                        this.showStudentProfile();
                    }, 1500);
                } else {
                    // Rollback การเพิ่มใน student registration หากเกิดข้อผิดพลาด
                    this.studentModel.removeRegistration(this.currentUser.id, subjectId);
                    this.view.showAlert('เกิดข้อผิดพลาดในการลงทะเบียน', 'error');
                }
            } else {
                this.view.showAlert('ไม่สามารถเพิ่มการลงทะเบียนได้', 'error');
            }
        } else {
            this.view.showAlert(`${enrollmentCheck.reason}`, 'error');
        }
    }

    /* ถอนวิชา
       - {string} subjectId - รหัสวิชา
    */

    withdrawSubject(subjectId) {
        if (!this.currentUser || this.isAdmin) return;

        const subject = this.subjectModel.getSubject(subjectId);
        if (!subject) {
            this.view.showAlert('ไม่พบข้อมูลวิชา', 'error');
            return;
        }

        // ยืนยันการถอน
        if (this.view.showConfirmation(`คุณต้องการถอนวิชา "${subject.name}" หรือไม่?`)) {
            // ลบการลงทะเบียนจากข้อมูลนักเรียน
            if (this.studentModel.removeRegistration(this.currentUser.id, subjectId)) {
                // ลดจำนวนคนที่ลงทะเบียนในวิชา
                if (this.subjectModel.unenrollStudent(subjectId)) {
                    this.view.showAlert(`ถอนวิชา "${subject.name}" สำเร็จ!`, 'warning');
                    this.showStudentProfile(); // รีเฟรชหน้า
                } else {
                    // Rollback การลบใน student registration หากเกิดข้อผิดพลาด
                    this.studentModel.addRegistration(this.currentUser.id, subjectId);
                    this.view.showAlert('เกิดข้อผิดพลาดในการถอนวิชา', 'error');
                }
            } else {
                this.view.showAlert('ไม่สามารถถอนวิชาได้', 'error');
            }
        }
    }

    /* อัพเดทเกรดนักเรียน (สำหรับแอดมิน)
       - {string} studentId - รหัสนักเรียน
       - {string} subjectId - รหัสวิชา
    */

    updateGrade(studentId, subjectId) {
        if (!this.isAdmin) return;

        const gradeSelect = document.getElementById(`grade-${studentId}-${subjectId}`);
        if (!gradeSelect) {
            this.view.showAlert('ไม่พบข้อมูลเกรด', 'error');
            return;
        }

        const grade = gradeSelect.value;
        const student = this.studentModel.getStudent(studentId);
        const subject = this.subjectModel.getSubject(subjectId);

        if (!student || !subject) {
            this.view.showAlert('ไม่พบข้อมูลนักเรียนหรือวิชา', 'error');
            return;
        }

        // อัพเดทเกรด
        if (this.studentModel.updateGrade(studentId, subjectId, grade)) {
            const gradeText = grade || 'ไม่มีเกรด';
            this.view.showAlert(`อัพเดทเกรดสำเร็จ! ${student.firstName} ${student.lastName} - ${subject.name}: ${gradeText}`, 'success');

            // เน้นสี element ที่เพิ่งอัพเดท
            this.view.highlightUpdatedElement(`grade-${studentId}-${subjectId}`);
        } else {
            this.view.showAlert('เกิดข้อผิดพลาดในการอัพเดทเกรด', 'error');
        }
    }

    /* ตรวจสอบสถานะการลงทะเบียน
       - {string} studentId - รหัสนักเรียน
       - {string} subjectId - รหัสวิชา
       - {Object} - สถานะการลงทะเบียน
    */

    checkEnrollmentStatus(studentId, subjectId) {
        const isRegistered = this.studentModel.isRegistered(studentId, subjectId);
        const canEnroll = this.subjectModel.canEnroll(subjectId, studentId, this.studentModel);
        const subject = this.subjectModel.getSubject(subjectId);
        const availableSeats = this.subjectModel.getAvailableSeats(subjectId);

        return {
            isRegistered,
            canEnroll: canEnroll.canEnroll,
            reason: canEnroll.reason,
            subject,
            availableSeats
        };
    }

    /* ดึงสถิติระบบ (สำหรับแอดมิน)
       - {Object} - สถิติระบบ
    */

    getSystemStatistics() {
        if (!this.isAdmin) return null;

        const enrollmentStats = this.subjectModel.getEnrollmentStatistics();
        const totalStudents = this.studentModel.getAllStudents().length;
        const studentsWithRegistrations = Object.keys(this.studentModel.registrations).length;

        return {
            ...enrollmentStats,
            totalStudents,
            studentsWithRegistrations,
            studentsWithoutRegistrations: totalStudents - studentsWithRegistrations
        };
    }

    // รีเซ็ตข้อมูลการลงทะเบียนทั้งหมด (สำหรับแอดมิน)
    resetAllRegistrations() {
        if (!this.isAdmin) return;

        if (this.view.showConfirmation('คุณต้องการรีเซ็ตข้อมูลการลงทะเบียนทั้งหมดหรือไม่?')) {
            // รีเซ็ตข้อมูลการลงทะเบียนนักเรียน
            this.studentModel.registrations = {};

            // รีเซ็ตจำนวนคนที่ลงทะเบียนในแต่ละวิชา
            this.subjectModel.getAllSubjects().forEach(subject => {
                subject.currentEnrolled = 0;
            });

            this.view.showAlert('รีเซ็ตข้อมูลการลงทะเบียนทั้งหมดเรียบร้อยแล้ว!', 'success');
            this.showAdminPanel(); // รีเฟรชหน้า
        }
    }

    /* ตรวจสอบความถูกต้องของข้อมูลนักเรียน
       - {string} studentId - รหัสนักเรียน
       - {Object} - ผลการตรวจสอบ
    */

    validateStudent(studentId) {
        const student = this.studentModel.getStudent(studentId);
        if (!student) {
            return { isValid: false, errors: ['ไม่พบข้อมูลนักเรียน'] };
        }

        const errors = [];

        // ตรวจสอบรหัสนักเรียน (8 หลัก เริ่มต้นด้วย 69)
        if (!/^69\d{6}$/.test(student.id)) {
            errors.push('รหัสนักเรียนไม่ถูกต้อง (ต้องเป็น 8 หลัก เริ่มต้นด้วย 69)');
        }

        // ตรวจสอบอายุ
        if (!this.studentModel.validateAge(student.birthDate)) {
            errors.push('อายุต้องอย่างน้อย 15 ปี');
        }

        // ตรวจสอบข้อมูลจำเป็น
        if (!student.firstName || !student.lastName) {
            errors.push('ข้อมูลชื่อ-นามสกุลไม่ครบถ้วน');
        }

        if (!student.email || !/\S+@\S+\.\S+/.test(student.email)) {
            errors.push('อีเมลไม่ถูกต้อง');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // ฟังก์ชันช่วยสำหรับการ debug (เฉพาะในโหมด development)
    debugInfo() {
        if (console && console.log) {
            console.log('=== DEBUG INFO ===');
            console.log('Current User:', this.currentUser);
            console.log('Is Admin:', this.isAdmin);
            console.log('All Students:', this.studentModel.getAllStudents());
            console.log('All Subjects:', this.subjectModel.getAllSubjects());
            console.log('All Registrations:', this.studentModel.registrations);
            console.log('System Statistics:', this.getSystemStatistics());
        }
    }
}