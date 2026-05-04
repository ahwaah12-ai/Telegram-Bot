<?php
$BOT_TOKEN = "8560546892:AAH0VMbTtWDB4x0x7-I8KsYqdrV5r4hTACw";
$WEBSITE_URL = "https://telegram-bot-nu-sooty.vercel.app";

$update = json_decode(file_get_contents('php://input'), true);

if (isset($update['message'])) {
    $chat_id = $update['message']['chat']['id'];
    $text = $update['message']['text'] ?? '';
    
    if ($text == '/start') {
        // إرسال رسالة مع زرار
        $reply_markup = json_encode([
            'inline_keyboard' => [
                [
                    ['text' => '🛍️ تسوق الآن واحصل على خصم 70%', 'url' => $WEBSITE_URL]
                ],
                [
                    ['text' => '🎁 عروض حصرية', 'url' => $WEBSITE_URL]
                ]
            ]
        ]);
        
        $message_text = "🎉 مرحباً بك في متجر التخفيضات!\n\n";
        $message_text .= "🔥 تخفيضات تصل إلى 70% على آلاف المنتجات\n";
        $message_text .= "🛒 شحن مجاني لكل الطلبات\n";
        $message_text .= "💰 الدفع عند الاستلام\n\n";
        $message_text .= "اضغط على الزر أدناه لبدء التسوق 👇";
        
        file_get_contents("https://api.telegram.org/bot$BOT_TOKEN/sendMessage?" . http_build_query([
            'chat_id' => $chat_id,
            'text' => $message_text,
            'reply_markup' => $reply_markup,
            'parse_mode' => 'HTML'
        ]));
    }
}
