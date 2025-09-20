class StudentModel {
    constructor() {
        // ข้อมูลนักเรียน 10 ราย
        this.students = [
            {
                id: '69001001',
                prefix: 'นาย',
                firstName: 'สมชาย',
                lastName: 'ใจดี',
                birthDate: '2006-05-15',
                school: 'โรงเรียนสตรีวิทยา',
                email: 'somchai@email.com',
                grades: { '05501001': 'A', '90690001': 'B+' }
            },
            {
                id: '69001002',
                prefix: 'นางสาว',
                firstName: 'สมหญิง',
                lastName: 'รักเรียน',
                birthDate: '2007-03-20',
                school: 'โรงเรียนเทพศิรินทร์',
                email: 'somying@email.com',
                grades: { '90690001': 'A' }
            },
            {
                id: '69001003',
                prefix: 'นาย',
                firstName: 'วีรชัย',
                lastName: 'มานะดี',
                birthDate: '2006-08-10',
                school: 'โรงเรียนสวนกุหลาบ',
                email: 'werachai@email.com',
                grades: {}
            },
            {
                id: '69001004',
                prefix: 'นางสาว',
                firstName: 'อรุณี',
                lastName: 'สดใส',
                birthDate: '2007-01-05',
                school: 'โรงเรียนรัตนโกสินทร์',
                email: 'arunee@email.com',
                grades: { '90690001': 'B' }
            },
            {
                id: '69001005',
                prefix: 'นาย',
                firstName: 'ธนาคาร',
                lastName: 'เก่งกาจ',
                birthDate: '2006-12-25',
                school: 'โรงเรียนจุฬาภรณ์',
                email: 'thanakarn@email.com',
                grades: { '05501001': 'B+', '90690001': 'A' }
            },
            {
                id: '69001006',
                prefix: 'นางสาว',
                firstName: 'มาลี',
                lastName: 'ขยันดี',
                birthDate: '2007-04-12',
                school: 'โรงเรียนสตรีวิทยา',
                email: 'malee@email.com',
                grades: {}
            },
            {
                id: '69001007',
                prefix: 'นาย',
                firstName: 'ประยุทธ',
                lastName: 'มุ่งมั่น',
                birthDate: '2006-09-30',
                school: 'โรงเรียนเตรียมอุดม',
                email: 'prayut@email.com',
                grades: { '90690001': 'B+' }
            },
            {
                id: '69001008',
                prefix: 'นางสาว',
                firstName: 'นิดา',
                lastName: 'ฉลาด',
                birthDate: '2007-02-18',
                school: 'โรงเรียนสตรีศรีสุราษฎร์',
                email: 'nida@email.com',
                grades: { '05501001': 'A', '90690001': 'A' }
            },
            {
                id: '69001009',
                prefix: 'นาย',
                firstName: 'เอกชัย',
                lastName: 'ทำดี',
                birthDate: '2006-11-08',
                school: 'โรงเรียนวัชรวิทย์',
                email: 'ekchai@email.com',
                grades: {}
            },
            {
                id: '69001010',
                prefix: 'นางสาว',
                firstName: 'สุนิสา',
                lastName: 'ใฝ่เรียน',
                birthDate: '2007-06-22',
                school: 'โรงเรียนสตรีราชินี',
                email: 'sunisa@email.com',
                grades: { '90690001': 'B+' }
            }
        ];

        // เก็บข้อมูลการลงทะเบียนของแต่ละคน
        this.registrations = {};
    }

    /* ตรวจสอบอายุว่าอย่างน้อย 15 ปีหรือไม่
       - {string} birthDate - วันเกิดในรูปแบบ YYYY-MM-DD
       - {boolean} - true ถ้าอายุ >= 15 ปี
    */

    validateAge(birthDate) {
        const birth = new Date(birthDate);
        const today = new Date();
        const age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            return age - 1 >= 15;
        }
        return age >= 15;
    }

    /* ค้นหานักเรียนจากรหัส
       - {string} id - รหัสนักเรียน
       - {Object|undefined} - ข้อมูลนักเรียน
    */

    getStudent(id) {
        return this.students.find(student => student.id === id);
    }

    /* ดึงข้อมูลการลงทะเบียนของนักเรียน
       - {string} studentId - รหัสนักเรียน
       - {Array} - รายการรหัสวิชาที่ลงทะเบียน
     */

    getStudentRegistrations(studentId) {
        return this.registrations[studentId] || [];
    }

    /* เพิ่มการลงทะเบียนวิชา
       - {string} studentId - รหัสนักเรียน
       - {string} subjectId - รหัสวิชา
       - {boolean} - true ถ้าเพิ่มสำเร็จ
    */

    addRegistration(studentId, subjectId) {
        if (!this.registrations[studentId]) {
            this.registrations[studentId] = [];
        }
        if (!this.registrations[studentId].includes(subjectId)) {
            this.registrations[studentId].push(subjectId);
            return true;
        }
        return false;
    }

    /* ถอนการลงทะเบียนวิชา
       - {string} studentId - รหัสนักเรียน
       - {string} subjectId - รหัสวิชา
       - {boolean} - true ถ้าถอนสำเร็จ
    */

    removeRegistration(studentId, subjectId) {
        if (this.registrations[studentId]) {
            const index = this.registrations[studentId].indexOf(subjectId);
            if (index > -1) {
                this.registrations[studentId].splice(index, 1);
                return true;
            }
        }
        return false;
    }

    /* อัพเดทเกรดนักเรียน
       - {string} studentId - รหัสนักเรียน
       - {string} subjectId - รหัสวิชา
       - {string} grade - เกรด
       - {boolean} - true ถ้าอัพเดทสำเร็จ
    */

    updateGrade(studentId, subjectId, grade) {
        const student = this.getStudent(studentId);
        if (student) {
            if (!student.grades) student.grades = {};
            student.grades[subjectId] = grade;
            return true;
        }
        return false;
    }

    /* ดึงรายชื่อนักเรียนทั้งหมด
       - {Array} - รายการนักเรียนทั้งหมด
    */

    getAllStudents() {
        return this.students;
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

    /* ตรวจสอบว่านักเรียนลงทะเบียนวิชานี้แล้วหรือยัง
       - {string} studentId - รหัสนักเรียน
       - {string} subjectId - รหัสวิชา
       - {boolean} - true ถ้าลงทะเบียนแล้ว
    */

    isRegistered(studentId, subjectId) {
        const registrations = this.getStudentRegistrations(studentId);
        return registrations.includes(subjectId);
    }
}