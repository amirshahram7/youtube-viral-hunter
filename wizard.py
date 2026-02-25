import streamlit as st

# Set page configuration to centered layout
st.set_page_config(page_title="جادوگر تیوب", layout="centered")

# Custom CSS for centering and styling
st.markdown("""
    <style>
    .main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .big-title {
        font-size: 50px !important;
        font-weight: bold;
        text-align: center;
        margin-bottom: 30px;
    }
    .prank-text {
        font-size: 80px !important;
        font-weight: bold;
        color: red;
        text-align: center;
        margin-top: 50px;
    }
    /* Centering the button container */
    div.stButton {
        display: flex;
        justify-content: center;
    }
    </style>
    """, unsafe_allow_html=True)

# Big Title
st.markdown('<div class="big-title">🎩 جادوگر تیوب</div>', unsafe_allow_html=True)

# Central Input box
user_input = st.text_input("", placeholder="موضوع رو بده...", label_visibility="collapsed")

# Search Button
if st.button("Search"):
    # Logic: Show huge, red, centered text
    st.markdown('<div class="prank-text">💨 گوزیدی</div>', unsafe_allow_html=True)
