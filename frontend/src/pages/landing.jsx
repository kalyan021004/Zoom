import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();

    const [isScrolled, setIsScrolled] = useState(false);
    const [animateHero, setAnimateHero] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        
        window.addEventListener('scroll', handleScroll);
        setAnimateHero(true);
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            title: "Crystal Clear Video",
            description: "Experience HD video calls with advanced noise cancellation",
            icon: "🎥"
        },
        {
            title: "Instant Connection",
            description: "Join meetings in seconds with our lightning-fast technology",
            icon: "⚡"
        },
        {
            title: "Secure & Private",
            description: "End-to-end encryption keeps your conversations protected",
            icon: "🔒"
        }
    ];

    return (
        <>
            <style jsx>{`
                :root {
                    --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    --gradient-accent: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    --gradient-bg: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
                }

                .landing-container {
                    background: var(--gradient-bg);
                    min-height: 100vh;
                    color: white;
                    overflow-x: hidden;
                }

                .floating-bg {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: -1;
                }

                .floating-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    animation: float 6s ease-in-out infinite;
                }

                .orb-1 {
                    width: 300px;
                    height: 300px;
                    background: linear-gradient(45deg, #667eea40, #764ba240);
                    top: -150px;
                    right: -150px;
                    animation-delay: 0s;
                }

                .orb-2 {
                    width: 400px;
                    height: 400px;
                    background: linear-gradient(45deg, #f093fb40, #f5576c40);
                    bottom: -200px;
                    left: -200px;
                    animation-delay: 2s;
                }

                .orb-3 {
                    width: 250px;
                    height: 250px;
                    background: linear-gradient(45deg, #4facfe40, #00f2fe40);
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    animation-delay: 4s;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }

                .navbar-glass {
                    transition: all 0.3s ease;
                    backdrop-filter: blur(20px);
                    background: rgba(15, 12, 41, 0.8) !important;
                    border-bottom: 1px solid rgba(102, 126, 234, 0.2);
                }

                .navbar-transparent {
                    background: transparent !important;
                    border-bottom: none;
                }

                .brand-logo {
                    width: 40px;
                    height: 40px;
                    background: var(--gradient-primary);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .brand-logo:hover {
                    transform: scale(1.1);
                }

                .brand-text {
                    background: var(--gradient-primary);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    font-weight: bold;
                    font-size: 1.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .brand-text:hover {
                    transform: scale(1.05);
                }

                .hero-animate {
                    opacity: 0;
                    transform: translateY(30px);
                    animation: slideUp 1s ease-out forwards;
                }

                .hero-animate-delay {
                    animation-delay: 0.3s;
                }

                @keyframes slideUp {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .gradient-text {
                    background: var(--gradient-primary);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .gradient-text-secondary {
                    background: var(--gradient-secondary);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .btn-gradient-primary {
                    background: var(--gradient-primary);
                    border: none;
                    color: white;
                    font-weight: bold;
                    padding: 12px 30px;
                    border-radius: 50px;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);
                }

                .btn-gradient-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
                    color: white;
                }

                .btn-gradient-outline {
                    background: transparent;
                    border: 2px solid #667eea;
                    color: white;
                    font-weight: bold;
                    padding: 12px 30px;
                    border-radius: 50px;
                    transition: all 0.3s ease;
                }

                .btn-gradient-outline:hover {
                    background: var(--gradient-primary);
                    transform: translateY(-2px);
                    color: white;
                }

                .nav-link-custom {
                    color: white !important;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    padding: 8px 16px;
                    border-radius: 25px;
                }

                .nav-link-custom:hover {
                    background: rgba(102, 126, 234, 0.2);
                    color: white !important;
                    transform: translateY(-2px);
                }

                .video-mockup {
                    background: linear-gradient(135deg, rgba(30, 30, 60, 0.8), rgba(50, 50, 90, 0.8));
                    border-radius: 20px;
                    padding: 20px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(102, 126, 234, 0.3);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                }

                .video-participant {
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
                    border-radius: 15px;
                    padding: 20px;
                    aspect-ratio: 16/9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .video-participant.featured {
                    background: linear-gradient(135deg, rgba(79, 172, 254, 0.3), rgba(0, 242, 254, 0.3));
                }

                .participant-avatar {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: var(--gradient-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                }

                .participant-avatar.large {
                    width: 80px;
                    height: 80px;
                    font-size: 2rem;
                    animation: bounce 2s ease-in-out infinite;
                }

                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                .control-btn {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                }

                .control-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
                }

                .control-btn.end-call {
                    background: linear-gradient(135deg, #ff6b6b, #ee5a52);
                }

                .control-btn.mute {
                    background: linear-gradient(135deg, #6c757d, #495057);
                }

                .floating-icon {
                    position: absolute;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
                    animation: float 3s ease-in-out infinite;
                }

                .floating-icon.icon-1 {
                    background: var(--gradient-secondary);
                    top: -20px;
                    right: -20px;
                    animation-delay: 0s;
                }

                .floating-icon.icon-2 {
                    background: var(--gradient-accent);
                    bottom: -20px;
                    left: -20px;
                    animation-delay: 1s;
                }

                .feature-card {
                    background: linear-gradient(135deg, rgba(30, 30, 60, 0.5), rgba(50, 50, 90, 0.5));
                    border-radius: 20px;
                    padding: 30px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(102, 126, 234, 0.2);
                    transition: all 0.3s ease;
                    height: 100%;
                }

                .feature-card:hover {
                    transform: translateY(-10px);
                    border-color: rgba(102, 126, 234, 0.4);
                    box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2);
                }

                .feature-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }

                .section-padding {
                    padding: 80px 0;
                }

                .hero-section {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    padding: 100px 0 80px;
                }

                .footer-section {
                    border-top: 1px solid rgba(102, 126, 234, 0.2);
                    background: rgba(15, 12, 41, 0.8);
                    backdrop-filter: blur(20px);
                }

                @media (max-width: 768px) {
                    .hero-section {
                        padding: 120px 0 60px;
                    }
                    
                    .display-1 {
                        font-size: 3rem;
                    }
                    
                    .floating-icon {
                        width: 50px;
                        height: 50px;
                        font-size: 1.2rem;
                    }
                }
            `}</style>

            <div className="landing-container">
                {/* Floating Background */}
                <div className="floating-bg">
                    <div className="floating-orb orb-1"></div>
                    <div className="floating-orb orb-2"></div>
                    <div className="floating-orb orb-3"></div>
                </div>

                {/* Navigation */}
                <nav className={`navbar navbar-expand-lg navbar-dark fixed-top ${
                    isScrolled ? 'navbar-glass' : 'navbar-transparent'
                }`}>
                    <div className="container">
                        <div className="d-flex align-items-center" onClick={() => navigate('/')}>
                            <div className="brand-logo me-2">FM</div>
                            <span className="brand-text">FriendsMeet</span>
                        </div>
                        
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        
                        <div className="collapse navbar-collapse" id="navbarNav">
                            <ul className="navbar-nav ms-auto">
                               
                                <li className="nav-item">
                                    <button 
                                        className="btn btn-link nav-link-custom"
                                        onClick={() => navigate("/auth")}
                                    >
                                        Register
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className="btn btn-link nav-link-custom"
                                        onClick={() => navigate("/home")}
                                    >
                                        Home
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className="btn btn-link nav-link-custom"
                                        onClick={() => navigate("/history")}
                                    >
                                        History
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className="btn btn-gradient-primary ms-2"
                                        onClick={() => navigate("/auth")}
                                    >
                                        Login
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="hero-section">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-6">
                                <div className={`text-center text-lg-start ${animateHero ? 'hero-animate' : ''}`}>
                                    <h1 className="display-1 fw-bold mb-4">
                                        <span className="gradient-text">Connect</span><br />
                                        <span className="text-white">with your</span><br />
                                        <span className="gradient-text-secondary">loved ones</span>
                                    </h1>
                                    <p className="lead mb-4 text-white-50">
                                        Bridge the distance with FriendsMeet's next-generation video calling platform
                                    </p>
                                    <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                                        <button 
                                            className="btn btn-gradient-primary btn-lg"
                                            onClick={() => navigate("/auth")}
                                        >
                                            Get Started Free
                                        </button>
                                        <button 
                                            className="btn btn-gradient-outline btn-lg"
                                            onClick={() => navigate("/aljk23")}
                                        >
                                            Try Demo
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-lg-6 mt-5 mt-lg-0">
                                <div className={`position-relative ${animateHero ? 'hero-animate hero-animate-delay' : ''}`}>
                                    <div className="video-mockup">
                                        <div className="row g-3 mb-3">
                                            <div className="col-6">
                                                <div className="video-participant">
                                                    <div className="participant-avatar">👨‍💻</div>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="video-participant">
                                                    <div className="participant-avatar">👩‍💼</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="video-participant featured mb-3">
                                            <div className="participant-avatar large">🎯</div>
                                        </div>
                                        
                                        <div className="d-flex justify-content-center gap-3">
                                            <button className="control-btn end-call">📞</button>
                                            <button className="control-btn mute">🎤</button>
                                            <button className="control-btn mute">📹</button>
                                        </div>
                                    </div>
                                    
                                    <div className="floating-icon icon-1">⚡</div>
                                    <div className="floating-icon icon-2">🔒</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="section-padding">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-8 mx-auto text-center mb-5">
                                <h2 className="display-4 fw-bold mb-4">
                                    Why Choose <span className="gradient-text">FriendsMeet</span>?
                                </h2>
                                <p className="lead text-white-50">
                                    Experience the future of video communication with our cutting-edge features
                                </p>
                            </div>
                        </div>
                        
                        <div className="row g-4">
                            {features.map((feature, index) => (
                                <div key={index} className="col-md-4">
                                    <div className="feature-card text-center">
                                        <div className="feature-icon">{feature.icon}</div>
                                        <h3 className="h4 fw-bold mb-3">{feature.title}</h3>
                                        <p className="text-white-50">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="section-padding text-center">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-8 mx-auto">
                                <h2 className="display-4 fw-bold mb-4">
                                    Ready to <span className="gradient-text">Connect</span>?
                                </h2>
                                <p className="lead text-white-50 mb-5">
                                    Join thousands of users who trust FriendsMeet for their video communication needs
                                </p>
                                <button 
                                    className="btn btn-gradient-primary btn-lg"
                                    onClick={() => navigate("/auth")}
                                >
                                    Start Your Journey
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="footer-section py-4">
                    <div className="container">
                        <div className="row">
                            <div className="col-12 text-center">
                                <div className="d-flex align-items-center justify-content-center mb-3">
                                    <div className="brand-logo me-2">FM</div>
                                    <span className="h5 mb-0 fw-bold">FriendsMeet</span>
                                </div>
                                <p className="text-white-50 mb-0">
                                    © 2025 FriendsMeet. Connecting hearts across distances.
                                </p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}