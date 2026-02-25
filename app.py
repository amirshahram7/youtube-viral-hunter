import streamlit as st
from googleapiclient.discovery import build
import pandas as pd

# --- تنظیمات صفحه ---
st.set_page_config(page_title="شکارچی ویدیوهای پربازدید", layout="wide", page_icon="🔥")

# --- استایل دهی (CSS) ---
st.markdown("""
<style>
    .stApp { direction: rtl; text-align: right; font-family: 'Tahoma', sans-serif; }
    div[data-testid="stMetricValue"] { font-size: 18px; }
    .stSelectbox, .stTextInput { text-align: right; }
    /* استایل دکمه قرمز یوتیوبی */
    div.stButton > button:first-child { 
        background-color: #FF0000; 
        color: white; 
        border-radius: 5px; 
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)

# --- توابع کمکی ---
def format_number(num):
    if num >= 1_000_000_000: return f"{num/1_000_000_000:.1f} B (میلیارد)"
    if num >= 1_000_000: return f"{num/1_000_000:.1f} M (میلیون)"
    if num >= 1_000: return f"{num/1_000:.1f} K (هزار)"
    return str(num)

def calculate_revenue(views, country):
    # تخمین ساده بر اساس کشور
    tier1 = ['US', 'GB', 'CA', 'AU', 'DE', 'CH'] 
    rpm = 4.0 if country in tier1 else 1.5
    if country == 'IR': rpm = 0
    return (views / 1000) * rpm, rpm

# --- بدنه اصلی ---
st.title("🔥 شکارچی ویدیوهای ویروسی (Viral Finder)")
st.caption("جستجوی ویدیو بر اساس تایتل و مرتب‌سازی بر اساس بازدید (نه سابسکرایبر)")
st.divider()

# سایدبار تنظیمات
with st.sidebar:
    st.header("⚙️ تنظیمات جستجو")
    api_key = st.text_input("🔑 کلید API یوتیوب:", type="password")
    
    st.markdown("---")
    st.subheader("👁️ فیلتر بازدید")
    # اسلایدر برای حداقل بازدید ویدیو
    min_views = st.slider("حداقل بازدید ویدیو:", 
                          min_value=100_000, 
                          max_value=50_000_000, 
                          value=1_000_000, 
                          step=500_000,
                          format="%d")
    st.info(f"ویدیوهایی که کمتر از {format_number(min_views)} بازدید داشته باشند حذف می‌شوند.")

if api_key:
    youtube = build('youtube', 'v3', developerKey=api_key)
    
    # --- بخش ۱: ورودی جستجو ---
    col1, col2 = st.columns([4, 1])
    with col1:
        query = st.text_input("موضوع یا کلمه کلیدی ویدیو (مثلاً: Minecraft, ASMR, Python Tutorial):")
    with col2:
        st.write("")
        st.write("")
        search_btn = st.button("🔍 بیاب و بچین!", use_container_width=True)

    if search_btn and query:
        with st.spinner('در حال شخم زدن یوتیوب برای یافتن پربازدیدترین‌ها...'):
            try:
                # 1. جستجوی ویدیوها بر اساس کلمه کلیدی و مرتب‌سازی بر اساس ViewCount
                search_response = youtube.search().list(
                    q=query,
                    type='video',
                    part='id',
                    maxResults=50, # گرفتن 50 نتیجه برتر
                    order='viewCount' # کلید ماجرا: از زیاد به کم
                ).execute()

                video_ids = [item['id']['videoId'] for item in search_response['items']]

                if not video_ids:
                    st.error("هیچ ویدیویی یافت نشد!")
                else:
                    # 2. گرفتن آمار دقیق ویدیوها (چون Search API آمار دقیق نمیده)
                    videos_stats = youtube.videos().list(
                        id=','.join(video_ids),
                        part='snippet,statistics'
                    ).execute()

                    # 3. استخراج آیدی کانال‌ها برای گرفتن کشور
                    channel_ids = list(set([v['snippet']['channelId'] for v in videos_stats['items']]))
                    
                    # 4. گرفتن اطلاعات کانال‌ها (برای کشور و سابسکرایبر)
                    channels_stats = youtube.channels().list(
                        id=','.join(channel_ids),
                        part='snippet,statistics'
                    ).execute()
                    
                    # ساخت دیکشنری برای دسترسی سریع به اطلاعات کانال
                    ch_info = {}
                    for ch in channels_stats['items']:
                        ch_info[ch['id']] = {
                            'subs': int(ch['statistics'].get('subscriberCount', 0)),
                            'country': ch['snippet'].get('country', 'N/A'),
                            'thumb': ch['snippet']['thumbnails']['default']['url']
                        }

                    # 5. ترکیب داده‌ها و فیلتر کردن
                    final_results = []
                    for vid in videos_stats['items']:
                        views = int(vid['statistics'].get('viewCount', 0))
                        
                        # *** شرط شما: حداقل بازدید ***
                        if views >= min_views:
                            ch_id = vid['snippet']['channelId']
                            ch_data = ch_info.get(ch_id, {})
                            
                            final_results.append({
                                'title': vid['snippet']['title'],
                                'video_id': vid['id'],
                                'views': views,
                                'date': vid['snippet']['publishedAt'][:10],
                                'channel_name': vid['snippet']['channelTitle'],
                                'channel_subs': ch_data.get('subs', 0),
                                'country': ch_data.get('country', 'Global'),
                                'thumb': vid['snippet']['thumbnails']['high']['url'],
                                'ch_thumb': ch_data.get('thumb', '')
                            })

                    # مرتب‌سازی نهایی (محض اطمینان)
                    final_results.sort(key=lambda x: x['views'], reverse=True)
                    
                    st.session_state['results'] = final_results
                    st.session_state['step'] = 2

            except Exception as e:
                st.error(f"خطا در ارتباط با یوتیوب: {e}")

    # --- بخش ۲: نمایش نتایج ---
    if st.session_state.get('step') == 2:
        results = st.session_state.get('results', [])
        
        if not results:
            st.warning(f"ویدیویی با موضوع '{query}' که بالای {format_number(min_views)} بازدید داشته باشد پیدا نشد.")
        else:
            st.success(f"{len(results)} ویدیو غول‌پیکر پیدا شد! (مرتب شده از بیشترین بازدید)")
            
            # ساخت لیست انتخابی هوشمند
            options = {}
            for res in results:
                label = f"👁️ {format_number(res['views'])} | {res['title']} (by {res['channel_name']})"
                options[label] = res
            
            selected_label = st.selectbox("ویدیو را انتخاب کنید تا آنالیز شود:", list(options.keys()))
            data = options[selected_label]

            st.divider()
            
            # --- بخش ۳: نمایش جزئیات و محاسبه درآمد ---
            col_media, col_info = st.columns([1, 2])
            
            with col_media:
                st.image(data['thumb'], use_container_width=True, caption="Thumbnail ویدیو")
                st.write("---")
                # نمایش کوچک کانال
                c1, c2 = st.columns([1, 3])
                with c1: st.image(data['ch_thumb'], width=50)
                with c2: 
                    st.write(f"**{data['channel_name']}**")
                    st.caption(f"👥 سابسکرایبر: {format_number(data['channel_subs'])}")

            with col_info:
                st.header(data['title'])
                
                # محاسبه درآمد
                revenue, rpm = calculate_revenue(data['views'], data['country'])
                
                # متریک‌ها
                m1, m2, m3 = st.columns(3)
                m1.metric("تعداد بازدید", format_number(data['views']))
                m2.metric("کشور سازنده", data['country'])
                m3.metric("تاریخ انتشار", data['date'])
                
                st.success(f"💰 درآمد تخمینی این ویدیو: ${revenue:,.2f}")
                st.caption(f"محاسبه شده با RPM تقریبی ${rpm} برای کشور {data['country']}")
                
                st.markdown(f"""
                **چرا این نتیجه مهم است؟**
                - شما ویدیویی با **{format_number(data['views'])}** بازدید پیدا کردید.
                - حتی اگر سابسکرایبر کانال کم باشد ({format_number(data['channel_subs'])}), این ویدیو توانسته ویرال شود.
                - لینک ویدیو: [تماشا در یوتیوب](https://www.youtube.com/watch?v={data['video_id']})
                """)

else:
    st.info("لطفاً کلید API را وارد کنید.")
