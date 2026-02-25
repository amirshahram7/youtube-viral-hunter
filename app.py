import streamlit as st
from googleapiclient.discovery import build
import pandas as pd
import isodate

# ۱. تنظیمات اولیه صفحه
st.set_page_config(page_title="شکارچی ویدیوهای ویروسی", page_icon="🔥", layout="wide")

# ۲. کدهای CSS برای راست‌چین کردن و زیبایی در موبایل
st.markdown("""
<style>
    /* راست‌چین کردن کل برنامه و تغییر فونت */
    * {
        direction: rtl;
        text-align: right;
        font-family: 'Tahoma', 'Vazirmatn', sans-serif;
    }
    
    /* چپ‌چین کردن ورودی‌های انگلیسی (مثل کلید API) */
    .stTextInput input {
        direction: ltr !important;
        text-align: left !important;
    }
    
    /* رفع مشکل آیکون منوی بازشونده */
    .streamlit-expanderHeader {
        direction: rtl;
    }
</style>
""", unsafe_allow_html=True)

# ۳. تیتر اصلی برنامه
st.title("🔥 شکارچی ویدیوهای ویروسی (Viral Finder)")
st.markdown("جستجوی ویدیو بر اساس موضوع و مرتب‌سازی بر اساس **بازدید** (نه سابسکرایبر)")

# ۴. بخش تنظیمات (جایگزین عالی برای سایدبار در موبایل)
with st.expander("⚙️ تنظیمات و وارد کردن کلید API (برای باز/بسته شدن اینجا کلیک کنید)", expanded=True):
    api_key = st.text_input("🔑 لطفاً کلید API یوتیوب خود را وارد کنید:", type="password")
    max_results = st.number_input("تعداد نتایج جستجو:", min_value=1, max_value=50, value=10)

# اگر کلید وارد نشده بود، برنامه متوقف شود
if not api_key:
    st.info("👈 برای استفاده از برنامه، لطفاً ابتدا کلید API خود را در کادر بالا وارد کنید.")
    st.stop()

# ۵. توابع ارتباط با یوتیوب
@st.cache_data
def search_viral_videos(query, max_res):
    try:
        youtube = build('youtube', 'v3', developerKey=api_key)
        request = youtube.search().list(
            q=query,
            part='snippet',
            type='video',
            order='viewCount', # یافتن ویدیوهای وایرال
            maxResults=max_res
        )
        response = request.execute()
        
        videos = []
        for item in response.get('items', []):
            videos.append({
                'عنوان': item['snippet']['title'],
                'کانال': item['snippet']['channelTitle'],
                'تاریخ انتشار': item['snippet']['publishedAt'][:10],
                'video_id': item['id']['videoId'],
                'channel_id': item['snippet']['channelId'],
                'تصویر': item['snippet']['thumbnails']['high']['url']
            })
        return pd.DataFrame(videos)
    except Exception as e:
        st.error(f"خطا در ارتباط با یوتیوب (احتمالاً کلید API نامعتبر است): {e}")
        return pd.DataFrame()

@st.cache_data
def get_video_details(video_id, channel_id):
    youtube = build('youtube', 'v3', developerKey=api_key)
    
    # گرفتن آمار ویدیو
    vid_req = youtube.videos().list(part='statistics', id=video_id)
    vid_res = vid_req.execute()
    views = int(vid_res['items'][0]['statistics']['viewCount'])
    
    # گرفتن کشور کانال
    ch_req = youtube.channels().list(part='snippet', id=channel_id)
    ch_res = ch_req.execute()
    country = ch_res['items'][0]['snippet'].get('country', 'نامشخص')
    
    # فرمول تخمین درآمد (به ازای هر هزار بازدید ۱ تا ۳ دلار)
    est_min = (views / 1000) * 1
    est_max = (views / 1000) * 3
    
    return views, country, est_min, est_max

# ۶. طراحی تب‌ها
tab1, tab2 = st.tabs(["🔍 جستجوی موضوعی (Viral Hunter)", "📊 آنالیز کانال"])

with tab1:
    st.header("شکار ویدیوهای پربازدید")
    search_query = st.text_input("موضوع مورد نظر خود را بنویسید (مثال: آموزش پایتون یا Funny cats):")
    
    if search_query:
        with st.spinner('در حال شکار ویدیوهای وایرال... 🕵️‍♂️'):
            df = search_viral_videos(search_query, max_results)
            
        if not df.empty:
            st.success("ویدیوها پیدا شدند!")
            
            # Master-Detail: انتخاب از لیست
            video_titles = df['عنوان'].tolist()
            selected_title = st.selectbox("📌 یک ویدیو را برای مشاهده جزئیات عمیق و تخمین درآمد انتخاب کنید:", video_titles)
            
            if selected_title:
                selected_video = df[df['عنوان'] == selected_title].iloc[0]
                
                st.write("---")
                col1, col2 = st.columns([1, 2])
                with col1:
                    # حل مشکل عکس با use_container_width
                    st.image(selected_video['تصویر'], use_container_width=True)
                with col2:
                    st.subheader(selected_title)
                    st.write(f"📺 **نام کانال:** {selected_video['کانال']}")
                    st.write(f"📅 **تاریخ ساخت:** {selected_video['تاریخ انتشار']}")
                    
                    with st.spinner('در حال محاسبه درآمد تخمینی... 💰'):
                        views, country, est_min, est_max = get_video_details(selected_video['video_id'], selected_video['channel_id'])
                        
                    st.write(f"🌍 **کشور کانال:** {country}")
                    st.write(f"👁️ **بازدید ویدیو:** {views:,}")
                    st.success(f"💵 **تخمین درآمد این ویدیو:** بین ${est_min:,.0f} تا ${est_max:,.0f}")
                
                # نمایش پلیر ویدیو
                st.video(f"https://www.youtube.com/watch?v={selected_video['video_id']}")
        elif search_query:
            st.warning("ویدیویی با این موضوع یافت نشد.")

with tab2:
    st.header("آنالیز مستقیم کانال")
    st.info("این بخش برای آپدیت‌های بعدی رزرو شده است. لطفاً فعلاً از تب «جستجوی موضوعی» استفاده کنید.")
