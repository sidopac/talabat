require('dotenv').config();  // تحميل المتغيرات من `config.env`
const express = require('express');  // استيراد Express لإنشاء الخادم
const mongoose = require('mongoose');  // استيراد Mongoose للاتصال بقاعدة البيانات
const cors = require('cors');  // تمكين CORS للسماح بالاتصال من أي مكان
const http = require('http');  // لإنشاء خادم HTTP
const { io } = require('./public/script');

const app = express();
const server = http.createServer(app);
exports.server = server;
// **📌 1️⃣ الاتصال بقاعدة البيانات**
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ تم الاتصال بقاعدة البيانات"))
  .catch(err => console.error("❌ خطأ في الاتصال بقاعدة البيانات:", err));

// **📌 2️⃣ إعداد Express**
app.use(express.json());  // تمكين قراءة البيانات بصيغة JSON
app.use(cors());  // السماح للواجهة الأمامية بالاتصال بالخادم

// **📌 3️⃣ إنشاء نموذج الطلبات في قاعدة البيانات**
const orderSchema = new mongoose.Schema({
    customerName: String,
    orderDetails: String,
    timestamp: { type: Date, default: Date.now }
});
const Order = mongoose.model("Order", orderSchema);

// **📌 4️⃣ نقطة API لإضافة طلب جديد**
app.post('/orders', async (req, res) => {
    const { customerName, orderDetails } = req.body;
    const newOrder = new Order({ customerName, orderDetails });
    await newOrder.save();
    
    io.emit("newOrder", newOrder); // إرسال إشعار فوري لكل المتصلين

    res.json({ message: "✅ تم حفظ الطلب", order: newOrder });
});

// **📌 5️⃣ نقطة API لجلب جميع الطلبات**
app.get('/orders', async (req, res) => {
    const orders = await Order.find().sort({ timestamp: -1 });
    res.json(orders);
});

// **📌 6️⃣ تشغيل الخادم**
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 الخادم يعمل على http://localhost:${PORT}`));