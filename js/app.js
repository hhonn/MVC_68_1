const app = {
    controller: null,

    /* Initialize the application */
    init() {
        try {
            // สร้าง Controller หลัก (จะสร้าง Model และ View อัตโนมัติ)
            this.controller = new RegistrationController();
            
            // แสดงหน้า Login เป็นค่าเริ่มต้น
            this.controller.view.showLogin();
            
            // Log การเริ่มต้นระบบ
            this.logStartup();
            
            // เรียก debug info ในโหมด development
            if (this.isDevelopmentMode()) {
                console.log('Development mode detected');
                // สามารถเรียก app.controller.debugInfo() ใน console ได้
                window.debugApp = () => this.controller.debugInfo();
            }
            
        } catch (error) {
            console.error('Error initializing application:', error);
            this.showCriticalError('ไม่สามารถเริ่มต้นระบบได้ กรุณารีเฟรชหน้าเว็บ');
        }
    },
    
    /* Log ข้อมูลการเริ่มต้นระบบ */
    logStartup() {
        console.log('ระบบลงทะเบียนเรียนล่วงหน้าเริ่มทำงานแล้ว');
        console.log('ข้อมูลการทดสอบ:');
        console.log('   นักเรียน: รหัส 69001001-69001010, รหัสผ่าน 123456');
        console.log('   แอดมิน: รหัส admin, รหัสผ่าน admin123');
        console.log('');
        console.log('  สถาปัตยกรรม MVC:');
        console.log('   Model: StudentModel, SubjectModel');
        console.log('   View: StudentView');
        console.log('   Controller: RegistrationController');
        console.log('');
        console.log(' เคล็ดลับ: พิมพ์ debugApp() ใน console เพื่อดู debug info');
    },
    
    /* ตรวจสอบว่าอยู่ในโหมด development หรือไม่
       - {boolean}
    */

    isDevelopmentMode() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.protocol === 'file:';
    },
    
    /* แสดงข้อผิดพลาดร้ายแรง
       - {string} message - ข้อความแจ้งข้อผิดพลาด
    */

    showCriticalError(message) {
        const body = document.body;
        body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            ">
                <div style="
                    background: white;
                    padding: 40px;
                    border-radius: 15px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    text-align: center;
                    max-width: 500px;
                ">
                    <h1 style="color: #dc3545; margin-bottom: 20px;">เกิดข้อผิดพลาด</h1>
                    <p style="margin-bottom: 20px; color: #666;">${message}</p>
                    <button onclick="window.location.reload()" style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 12px 24px;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: bold;
                    ">รีเฟรชหน้าเว็บ</button>
                </div>
            </div>
        `;
    },
    
    /* ตรวจสอบความพร้อมของ Browser
       - {Object} - ข้อมูลความพร้อม
    */

    checkBrowserCompatibility() {
        const compatibility = {
            isSupported: true,
            missingFeatures: []
        };
        
        // ตรวจสอบ JavaScript ES6+ features ที่จำเป็น
        if (!window.Promise) {
            compatibility.isSupported = false;
            compatibility.missingFeatures.push('Promise');
        }
        
        if (!Array.prototype.find) {
            compatibility.isSupported = false;
            compatibility.missingFeatures.push('Array.prototype.find');
        }
        
        if (!document.querySelector) {
            compatibility.isSupported = false;
            compatibility.missingFeatures.push('document.querySelector');
        }
        
        return compatibility;
    },
    
    // ตั้งค่า Error Handlers

    setupErrorHandlers() {
        // Global error handler
        window.onerror = (message, source, lineno, colno, error) => {
            console.error('Global Error:', {
                message,
                source,
                lineno,
                colno,
                error
            });
            return false; // ให้ browser แสดง error ด้วย
        };
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', event => {
            console.error('Unhandled Promise Rejection:', event.reason);
        });
    },
    
    // ตั้งค่า Performance Monitoring
    setupPerformanceMonitoring() {
        if (window.performance && window.performance.mark) {
            window.performance.mark('app-start');
            
            // Monitor page load time
            window.addEventListener('load', () => {
                window.performance.mark('app-loaded');
                if (window.performance.measure) {
                    window.performance.measure('app-load-time', 'app-start', 'app-loaded');
                    const loadTime = window.performance.getEntriesByName('app-load-time')[0];
                    if (loadTime && this.isDevelopmentMode()) {
                        console.log(`App loaded in ${loadTime.duration.toFixed(2)}ms`);
                    }
                }
            });
        }
    },
    
    // Utility function สำหรับการ format ข้อมูล
    utils: {
        /* Format เลขให้มี comma
           - {number} num - ตัวเลข
           - {string} - ตัวเลขที่ format แล้ว
        */

        formatNumber(num) {
            return new Intl.NumberFormat('th-TH').format(num);
        },
        
        /* Format วันที่เป็นภาษาไทย
           - {Date|string} date - วันที่
           - {string} - วันที่ในรูปแบบภาษาไทย
         */
        formatThaiDate(date) {
            const d = new Date(date);
            return d.toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },
        
        /* สร้าง unique ID
           - {string} - unique ID
        */

        generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        },
        
        /* Debounce function
           - {Function} func - ฟังก์ชันที่ต้อง debounce
           - {number} wait - เวลา delay (ms)
           - {Function} - ฟังก์ชันที่ debounce แล้ว
        */

        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        /* Deep clone object
           - {Object} obj - object ที่ต้อง clone
           - {Object} - object ที่ clone แล้ว
        */

        deepClone(obj) {
            if (obj === null || typeof obj !== 'object') return obj;
            if (obj instanceof Date) return new Date(obj);
            if (obj instanceof Array) return obj.map(item => this.deepClone(item));
            if (typeof obj === 'object') {
                const clonedObj = {};
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        clonedObj[key] = this.deepClone(obj[key]);
                    }
                }
                return clonedObj;
            }
        },
        
        /* Validate email format
           - {string} email - email address
           - {boolean} - true ถ้า email ถูกต้อง
        */

        validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },
        
        /* Sanitize string สำหรับ HTML
           - {string} str - string ที่ต้อง sanitize
           - {string} - string ที่ sanitize แล้ว
        */

        sanitizeHTML(str) {
            const temp = document.createElement('div');
            temp.textContent = str;
            return temp.innerHTML;
        }
    }
};

// ตั้งค่า Error Handlers ก่อนเริ่มต้นแอป
app.setupErrorHandlers();

// ตั้งค่า Performance Monitoring
app.setupPerformanceMonitoring();

// เริ่มต้นแอปพลิเคชันเมื่อ DOM พร้อม
document.addEventListener('DOMContentLoaded', () => {
    // ตรวจสอบความพร้อมของ Browser
    const compatibility = app.checkBrowserCompatibility();
    
    if (!compatibility.isSupported) {
        app.showCriticalError(
            `Browser ของคุณไม่รองรับระบบนี้<br>
             คุณสมบัติที่ขาดหายไป: ${compatibility.missingFeatures.join(', ')}<br>
             กรุณาใช้ Browser ที่ทันสมัยกว่านี้`
        );
        return;
    }
    
    // เริ่มต้นแอปพลิเคชัน
    app.init();
});

// Export สำหรับการใช้งานใน environment อื่น ๆ (เช่น Node.js testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = app;
}

// สร้าง Global shortcuts สำหรับ Development
if (app.isDevelopmentMode()) {
    window.app = app;
    
    // เพิ่ม keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+D = Debug info
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            if (app.controller) {
                app.controller.debugInfo();
            }
        }
        
        // Ctrl+Shift+R = Reset registrations (Admin only)
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            if (app.controller && app.controller.isAdmin) {
                app.controller.resetAllRegistrations();
            }
        }
        
        // ESC = Logout
        if (e.key === 'Escape') {
            if (app.controller && app.controller.currentUser) {
                app.controller.logout();
            }
        }
    });
    
    console.log('  Development Shortcuts:');
    console.log('   Ctrl+Shift+D = Show debug info');
    console.log('   Ctrl+Shift+R = Reset registrations (Admin only)');
    console.log('   ESC = Logout');
}