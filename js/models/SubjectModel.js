class SubjectModel {
    constructor() {
        // ข้อมูลรายวิชา 11 วิชา
        this.subjects = [
            {
                id: '05501001',
                name: 'Basic Mathematics',
                credits: 3,
                instructor: 'ผศ.ดร.สมศรี ใจดี',
                prerequisite: null,
                maxStudents: 50,
                currentEnrolled: 0
            },
            {
                id: '05501002',
                name: 'Calculus 1',
                credits: 4,
                instructor: 'รศ.ดร.วิชัย คิดดี',
                prerequisite: '05501001',
                maxStudents: 40,
                currentEnrolled: 0
            },
            {
                id: '05501003',
                name: 'Linear Algebra',
                credits: 3,
                instructor: 'อจ.ดร.นิดา ฉลาด',
                prerequisite: '05501001',
                maxStudents: 35,
                currentEnrolled: 0
            },
            {
                id: '05501004',
                name: 'Business Statistics',
                credits: 3,
                instructor: 'ผศ.สุรชัย วิเคราะห์ดี',
                prerequisite: null,
                maxStudents: 45,
                currentEnrolled: 0
            },
            {
                id: '05501005',
                name: 'Basic Physics',
                credits: 4,
                instructor: 'รศ.ดร.ธีระ สดใส',
                prerequisite: null,
                maxStudents: 30,
                currentEnrolled: 0
            },
            {
                id: '05501006',
                name: 'General Chemistry',
                credits: 4,
                instructor: 'ผศ.ดร.มาลี ทดลองดี',
                prerequisite: null,
                maxStudents: -1,
                currentEnrolled: 0
            },
            {
                id: '90690001',
                name: 'Basic English',
                credits: 3,
                instructor: 'อจ.จอห์น สมิท',
                prerequisite: null,
                maxStudents: 60,
                currentEnrolled: 0
            },
            {
                id: '90690002',
                name: 'Intermediate English',
                credits: 3,
                instructor: 'อจ.แมรี่ โจนส์',
                prerequisite: '90690001',
                maxStudents: 50,
                currentEnrolled: 0
            },
            {
                id: '90690003',
                name: 'Introduction to Philosophy',
                credits: 3,
                instructor: 'รศ.ดร.ปัญญา คิดลึก',
                prerequisite: null,
                maxStudents: 40,
                currentEnrolled: 0
            },
            {
                id: '90690004',
                name: 'General Psychology',
                credits: 3,
                instructor: 'ผศ.ดร.สุดา เข้าใจดี',
                prerequisite: null,
                maxStudents: 35,
                currentEnrolled: 0
            },
            {
                id: '90690005',
                name: 'Introduction to Sociology',
                credits: 3,
                instructor: 'อจ.ดร.วิรัช วิเคราะห์สังคม',
                prerequisite: null,
                maxStudents: 45,
                currentEnrolled: 0
            }
        ];
    }

    /* ดึงข้อมูลรายวิชาทั้งหมด
       - {Array} - รายการวิชาทั้งหมด
    */

    getAllSubjects() {
        return this.subjects;
    }

    /* ค้นหาวิชาจากรหัส
       - {string} id - รหัสวิชา
       - {Object|undefined} - ข้อมูลวิชา
    */

    getSubject(id) {
        return this.subjects.find(subject => subject.id === id);
    }

    /* ตรวจสอบว่าสามารถลงทะเบียนได้หรือไม่
       - {string} subjectId - รหัสวิชา
       - {string} studentId - รหัสนักเรียน
       - {StudentModel} studentModel - Model ของนักเรียน
       - {Object} - ผลการตรวจสอบ { canEnroll: boolean, reason: string }
    */

    canEnroll(subjectId, studentId, studentModel) {
        const subject = this.getSubject(subjectId);
        const student = studentModel.getStudent(studentId);

        if (!subject || !student) {
            return { canEnroll: false, reason: 'ไม่พบข้อมูลวิชาหรือนักเรียน' };
        }

        // ตรวจสอบอายุ (Business Rule: อายุอย่างน้อย 15 ปี)
        if (!studentModel.validateAge(student.birthDate)) {
            return { canEnroll: false, reason: 'อายุต้องอย่างน้อย 15 ปี' };
        }

        // ตรวจสอบวิชาบังคับก่อน (Business Rule: ต้องมีเกรดวิชาบังคับก่อน)
        if (subject.prerequisite) {
            if (!student.grades[subject.prerequisite]) {
                const prereqSubject = this.getSubject(subject.prerequisite);
                return {
                    canEnroll: false,
                    reason: `ต้องเรียนวิชาบังคับก่อน: ${prereqSubject ? prereqSubject.name : subject.prerequisite}`
                };
            }
        }

        // ตรวจสอบจำนวนคนสูงสุด (Business Rule: ไม่เกินจำนวนที่กำหนด)
        if (subject.maxStudents !== -1 && subject.currentEnrolled >= subject.maxStudents) {
            return { canEnroll: false, reason: 'วิชานี้เต็มแล้ว' };
        }

        // ตรวจสอบว่าลงทะเบียนแล้วหรือยัง
        const registrations = studentModel.getStudentRegistrations(studentId);
        if (registrations.includes(subjectId)) {
            return { canEnroll: false, reason: 'ลงทะเบียนวิชานี้แล้ว' };
        }

        return { canEnroll: true };
    }

    /* ลงทะเบียนนักเรียนเข้าวิชา (เพิ่มจำนวนคนที่ลงทะเบียน)
       - {string} subjectId - รหัสวิชา
       - {boolean} - true ถ้าลงทะเบียนสำเร็จ
    */

    enrollStudent(subjectId) {
        const subject = this.getSubject(subjectId);
        if (subject && (subject.maxStudents === -1 || subject.currentEnrolled < subject.maxStudents)) {
            subject.currentEnrolled++;
            return true;
        }
        return false;
    }

    /* ถอนการลงทะเบียนนักเรียนจากวิชา (ลดจำนวนคนที่ลงทะเบียน)
       - {string} subjectId - รหัสวิชา
       - {boolean} - true ถ้าถอนสำเร็จ
    */

    unenrollStudent(subjectId) {
        const subject = this.getSubject(subjectId);
        if (subject && subject.currentEnrolled > 0) {
            subject.currentEnrolled--;
            return true;
        }
        return false;
    }

    /* ตรวจสอบว่าวิชามีจำนวนคนสูงสุดหรือไม่
       - {string} subjectId - รหัสวิชา
       - {boolean} - true ถ้ามีจำนวนคนสูงสุด
    */

    hasMaxStudentsLimit(subjectId) {
        const subject = this.getSubject(subjectId);
        return subject && subject.maxStudents !== -1;
    }

    /* ตรวจสอบว่าวิชาเต็มแล้วหรือไม่
       - {string} subjectId - รหัสวิชา
       - {boolean} - true ถ้าวิชาเต็มแล้ว
    */

    isFull(subjectId) {
        const subject = this.getSubject(subjectId);
        if (!subject) return false;
        if (subject.maxStudents === -1) return false;
        return subject.currentEnrolled >= subject.maxStudents;
    }

    /* ดึงจำนวนที่นั่งว่าง
       - {string} subjectId - รหัสวิชา
       - {number} - จำนวนที่นั่งว่าง (-1 ถ้าไม่จำกัด)
    */

    getAvailableSeats(subjectId) {
        const subject = this.getSubject(subjectId);
        if (!subject) return 0;
        if (subject.maxStudents === -1) return -1;
        return Math.max(0, subject.maxStudents - subject.currentEnrolled);
    }

    /* ดึงรายวิชาตามประเภท (คณะหรือศึกษาทั่วไป)
       - {string} type - 'faculty' หรือ 'general'
       - {Array} - รายการวิชาตามประเภท
    */

    getSubjectsByType(type) {
        if (type === 'faculty') {
            return this.subjects.filter(subject => subject.id.startsWith('0550'));
        } else if (type === 'general') {
            return this.subjects.filter(subject => subject.id.startsWith('9069'));
        }
        return this.subjects;
    }

    /* ดึงรายวิชาที่ไม่มีวิชาบังคับก่อน
       - {Array} - รายการวิชาที่ไม่มีวิชาบังคับก่อน
    */

    getSubjectsWithoutPrerequisite() {
        return this.subjects.filter(subject => !subject.prerequisite);
    }

    /* ดึงรายวิชาที่มีวิชาบังคับก่อน
       - {Array} - รายการวิชาที่มีวิชาบังคับก่อน
    */

    getSubjectsWithPrerequisite() {
        return this.subjects.filter(subject => subject.prerequisite);
    }

    /* คำนวณสถิติการลงทะเบียน
       - {Object} - สถิติการลงทะเบียน
    */

    getEnrollmentStatistics() {
        const totalSubjects = this.subjects.length;
        const totalEnrolled = this.subjects.reduce((sum, subject) => sum + subject.currentEnrolled, 0);
        const fullSubjects = this.subjects.filter(subject => this.isFull(subject.id)).length;
        const unlimitedSubjects = this.subjects.filter(subject => subject.maxStudents === -1).length;

        return {
            totalSubjects,
            totalEnrolled,
            fullSubjects,
            unlimitedSubjects,
            averageEnrollment: totalSubjects > 0 ? (totalEnrolled / totalSubjects).toFixed(2) : 0
        };
    }
}