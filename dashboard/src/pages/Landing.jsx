import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function Landing() {
  useEffect(() => {
    const handleScroll = () => {
      const nav = document.getElementById('navbar');
      if (nav) {
        if (window.scrollY > 10) {
          nav.classList.add('shadow-md');
          nav.classList.replace('bg-surface/80', 'bg-surface/95');
        } else {
          nav.classList.remove('shadow-md');
          nav.classList.replace('bg-surface/95', 'bg-surface/80');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="font-display antialiased bg-background text-on-background min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md border-b border-outline-variant/30 shadow-sm transition-all duration-300" id="navbar">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-sm">
            <img alt="TrackForge Logo" className="h-8 w-8 object-contain" src="https://lh3.googleusercontent.com/aida/AP1WRLv4uBxu2PSVAUy2boBbpgzeJwfeOp-hJe9bTNIsBxHP4p0fClRJBg6ZESCMYFyu2ZpqAivY0SlqNHqCXU0KO6WGi6fAIXADlX51dsz6tcS30Bwurv2lkxIlzG5ivZKf5h9Z0RtBy89w10-8ghauNY9a0kX5pc4_jNpy3Qx4O5EGgxO7Rv5gFOm8LCqEKULSjryY3chd3gvlvkizBjKgw12eCCOaao3on53qOYU8u8-VcD7hpdPEstZ7PA" />
            <span className="font-display text-title-md font-bold text-primary dark:text-primary-fixed">TrackForge</span>
          </div>
          <div className="flex items-center gap-md">
            <div className="hidden md:flex items-center gap-lg mr-4">
              <a className="text-on-surface-variant hover:text-primary font-display text-body-lg transition-colors" href="#">Features</a>
              <a className="text-on-surface-variant hover:text-primary font-display text-body-lg transition-colors" href="#">How It Works</a>
              <a className="text-on-surface-variant hover:text-primary font-display text-body-lg transition-colors" href="#">Demo</a>
              <Link to="/sessions" className="text-on-surface-variant hover:text-primary font-display text-body-lg transition-colors">Dashboard</Link>
            </div>
            <ThemeToggle />
            <button aria-label="Menu" className="md:hidden text-on-surface">
              <span aria-hidden="true" className="material-symbols-outlined text-2xl">menu</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-2xl md:pt-48 md:pb-32 px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2xl items-center">
          <div className="space-y-lg z-10 relative">
            <div className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full font-display text-label-md mb-2 border border-primary/20">
              Interactive Tutorial Mode
            </div>
            <h1 className="font-display text-display text-on-background">Generate Live Tracking Data!</h1>
            <p className="font-display text-body-lg text-on-surface-variant max-w-[36rem]">
              <strong>Step 1:</strong> Tap around here and there. Click the dummy buttons below to simulate user activity. Every click is tracked!
            </p>
            <div className="flex flex-wrap gap-md pt-2 pb-6 border-b border-outline-variant/30">
              <button 
                type="button"
                className="btn-primary"
              >
                Get Started Free
              </button>
              <button 
                type="button"
                className="btn-secondary"
              >
                Book a Demo
              </button>
              <button 
                type="button"
                className="btn-secondary border-none"
              >
                Read the Docs
              </button>
            </div>
            
            <div className="pt-4">
              <p className="font-display text-body-lg text-on-surface-variant max-w-[36rem] mb-4">
                <strong>Step 2:</strong> Once you've clicked around, open the dashboard to see your session and heatmaps!
              </p>
              <Link to="/sessions" className="btn-primary text-on-primary font-display text-title-md px-8 py-4 rounded-lg hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2 w-fit relative overflow-hidden group">
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                <span className="material-symbols-outlined text-2xl relative z-10">dashboard</span> 
                <span className="relative z-10 font-bold">Go To Dashboard</span>
              </Link>
            </div>
          </div>
          <div className="relative w-full h-[400px] md:h-[600px] lg:h-auto z-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl -z-10 transform translate-x-1/4 translate-y-1/4"></div>
            <img alt="TrackForge Dashboard showing analytics" className="w-full h-auto object-cover rounded-xl shadow-2xl border border-outline-variant/50 z-0 relative" src="https://lh3.googleusercontent.com/aida/AP1WRLubXkVUSF2o1W_WX65PDXy7NZE32lbPoT0hXf8KImwOLXe40kaAXvP3QoQH7AQwLTNu0DdmpXZskidMaTJlkdOp_InUC9AA0a6OozAI7uve5X_HtiorMK5vy4FP32mK9-CpgWO1LsBMsEghuS1DP12oeO95P0EmL8ACgO5v1eRniLypnnCL1IAzwv42L5vtybzyOMCB19zm63JcVt-xcXz8ZWga2WH2RKd0YMpg0R9Ro6G29JH9_BI66g" />
            
            {/* Floating Metrics */}
            <div className="absolute -left-8 top-1/4 glass-card p-md rounded-lg z-20 animate-bounce" style={{ animationDuration: '4s' }}>
              <div className="flex items-center gap-sm">
                <div className="bg-primary/10 p-xs rounded-full"><span className="material-symbols-outlined text-primary text-sm">group</span></div>
                <div>
                  <p className="font-display text-label-md text-on-surface-variant">Active Sessions</p>
                  <p className="font-display text-title-md text-on-background">2,451</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 bottom-1/3 glass-card p-md rounded-lg z-20 animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>
              <div className="flex items-center gap-sm">
                <div className="bg-secondary/10 p-xs rounded-full"><span className="material-symbols-outlined text-secondary text-sm">list_alt</span></div>
                <div>
                  <p className="font-display text-label-md text-on-surface-variant">Event Feed</p>
                  <p className="font-display text-title-md text-on-background">Live</p>
                </div>
              </div>
            </div>
            <div className="absolute left-1/4 -bottom-6 glass-card p-md rounded-lg z-20 animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '0.5s' }}>
              <div className="flex items-center gap-sm">
                <div className="bg-tertiary/10 p-xs rounded-full"><span className="material-symbols-outlined text-tertiary text-sm">route</span></div>
                <div>
                  <p className="font-display text-label-md text-on-surface-variant">Session Timeline</p>
                  <p className="font-display text-title-md text-on-background">Recording</p>
                </div>
              </div>
            </div>
            <div className="absolute right-1/4 top-0 glass-card p-md rounded-lg z-20 animate-bounce" style={{ animationDuration: '6s', animationDelay: '1.5s' }}>
              <div className="flex items-center gap-sm">
                <div className="bg-error/10 p-xs rounded-full"><span className="material-symbols-outlined text-error text-sm">local_fire_department</span></div>
                <div>
                  <p className="font-display text-label-md text-on-surface-variant">Heatmap Snapshot</p>
                  <p className="font-display text-title-md text-on-background">Generated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-2xl px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto">
        <div className="text-center mb-2xl max-w-[42rem] mx-auto">
          <h2 className="font-display text-headline-lg text-on-background mb-sm">Everything You Need To Understand User Behavior</h2>
          <p className="font-display text-body-lg text-on-surface-variant">Comprehensive tools to analyze, visualize, and optimize the digital experience without writing complex queries.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          <div className="glass-card p-lg rounded-xl hover:-translate-y-1 transition-transform duration-300 group">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-md group-hover:bg-primary transition-colors">
              <span className="material-symbols-outlined text-primary group-hover:text-on-primary">videocam</span>
            </div>
            <h3 className="font-display text-title-md text-on-background mb-xs">Session Tracking</h3>
            <p className="font-display text-body-md text-on-surface-variant">Capture page views, clicks, timestamps, and session activity.</p>
          </div>
          <div className="glass-card p-lg rounded-xl hover:-translate-y-1 transition-transform duration-300 group">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-md group-hover:bg-secondary transition-colors">
              <span className="material-symbols-outlined text-secondary group-hover:text-on-secondary">local_fire_department</span>
            </div>
            <h3 className="font-display text-title-md text-on-background mb-xs">Heatmap Analytics</h3>
            <p className="font-display text-body-md text-on-surface-variant">Visualize click density and engagement hotspots.</p>
          </div>
          <div className="glass-card p-lg rounded-xl hover:-translate-y-1 transition-transform duration-300 group">
            <div className="w-12 h-12 bg-tertiary/10 rounded-lg flex items-center justify-center mb-md group-hover:bg-tertiary transition-colors">
              <span className="material-symbols-outlined text-tertiary group-hover:text-on-tertiary">route</span>
            </div>
            <h3 className="font-display text-title-md text-on-background mb-xs">Journey Explorer</h3>
            <p className="font-display text-body-md text-on-surface-variant">Track user navigation paths across pages and interactions.</p>
          </div>
          <div className="glass-card p-lg rounded-xl hover:-translate-y-1 transition-transform duration-300 group">
            <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center mb-md group-hover:bg-error transition-colors">
              <span className="material-symbols-outlined text-error group-hover:text-on-error">bolt</span>
            </div>
            <h3 className="font-display text-title-md text-on-background mb-xs">Real-Time Insights</h3>
            <p className="font-display text-body-md text-on-surface-variant">Observe incoming events and active sessions instantly.</p>
          </div>
        </div>
      </section>

      {/* Product Architecture Section */}
      <section className="py-2xl px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto">
        <div className="text-center mb-2xl">
          <h2 className="font-display text-headline-lg text-on-background mb-sm">Product Architecture</h2>
          <p className="font-display text-body-lg text-on-surface-variant">Seamlessly integrated into your stack to provide powerful insights.</p>
        </div>
        <div className="flex flex-col md:flex-row items-start justify-between gap-lg relative">
          <div className="hidden md:block absolute top-[40px] left-[10%] right-[10%] h-0.5 bg-outline-variant/50 -translate-y-1/2 z-0"></div>
          
          <div className="flex-1 text-center relative z-10 p-md">
            <div className="w-20 h-20 bg-surface text-primary rounded-full flex items-center justify-center mx-auto mb-md shadow-lg border-4 border-surface">
              <span className="material-symbols-outlined text-3xl">touch_app</span>
            </div>
            <h3 className="font-display text-title-md text-on-background mb-xs">User Interaction</h3>
            <p className="font-display text-body-md text-on-surface-variant">Events triggered on client side.</p>
          </div>
          <div className="flex-1 text-center relative z-10 p-md">
            <div className="w-20 h-20 bg-surface text-secondary rounded-full flex items-center justify-center mx-auto mb-md shadow-lg border-4 border-surface">
              <span className="material-symbols-outlined text-3xl">code</span>
            </div>
            <h3 className="font-display text-title-md text-on-background mb-xs">Tracking Script</h3>
            <p className="font-display text-body-md text-on-surface-variant">Lightweight snippet captures data.</p>
          </div>
          <div className="flex-1 text-center relative z-10 p-md">
            <div className="w-20 h-20 bg-surface text-tertiary rounded-full flex items-center justify-center mx-auto mb-md shadow-lg border-4 border-surface">
              <span className="material-symbols-outlined text-3xl">api</span>
            </div>
            <h3 className="font-display text-title-md text-on-background mb-xs">Event Collection API</h3>
            <p className="font-display text-body-md text-on-surface-variant">Receives and validates payloads.</p>
          </div>
          <div className="flex-1 text-center relative z-10 p-md">
            <div className="w-20 h-20 bg-surface text-error rounded-full flex items-center justify-center mx-auto mb-md shadow-lg border-4 border-surface">
              <span className="material-symbols-outlined text-3xl">storage</span>
            </div>
            <h3 className="font-display text-title-md text-on-background mb-xs">MongoDB Storage</h3>
            <p className="font-display text-body-md text-on-surface-variant">Stores semi-structured event data.</p>
          </div>
          <div className="flex-1 text-center relative z-10 p-md">
            <div className="w-20 h-20 bg-surface text-primary rounded-full flex items-center justify-center mx-auto mb-md shadow-lg border-4 border-surface">
              <span className="material-symbols-outlined text-3xl">dashboard</span>
            </div>
            <h3 className="font-display text-title-md text-on-background mb-xs">Analytics Dashboard</h3>
            <p className="font-display text-body-md text-on-surface-variant">Visualizes insights and metrics.</p>
          </div>
        </div>
      </section>

      {/* Mock Interactive SaaS Elements for Tracking */}
      <section className="py-2xl bg-surface-container-lowest px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto border-y border-outline-variant/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary/5 via-transparent to-transparent"></div>
        <div className="text-center mb-xl relative z-10">
          <div className="inline-block bg-secondary/10 text-secondary px-4 py-1.5 rounded-full font-display text-label-md mb-2 border border-secondary/20">
            Interactive Test Area
          </div>
          <h2 className="font-display text-headline-lg text-on-background mb-sm">Test The Tracking Capabilities</h2>
          <p className="font-display text-body-lg text-on-surface-variant max-w-[42rem] mx-auto">
            Interact with the pricing plans and contact form below. The tracker will capture these clicks and your exact scroll depth!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl relative z-10">
          {/* Pricing Mock */}
          <div className="glass-card p-xl rounded-2xl border border-outline-variant flex flex-col items-center hover:border-primary/50 transition-colors">
            <div className="w-full text-center pb-6 border-b border-outline-variant/50 mb-6">
              <h3 className="font-display text-title-lg text-on-background mb-2">Enterprise Plan</h3>
              <p className="text-display text-primary font-bold">$499<span className="text-title-md text-on-surface-variant font-normal">/mo</span></p>
            </div>
            <ul className="space-y-4 mb-8 w-full px-4">
              <li className="flex items-center gap-3 text-on-surface"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> Unlimited Analytics Sessions</li>
              <li className="flex items-center gap-3 text-on-surface"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> 1 Year Data Retention</li>
              <li className="flex items-center gap-3 text-on-surface"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> Custom Canvas Heatmaps</li>
              <li className="flex items-center gap-3 text-on-surface"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> Dedicated Account Manager</li>
            </ul>
            <button 
              className="btn-primary w-full justify-center"
            >
              Start Free Trial <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          {/* Contact Form Mock */}
          <div className="glass-card p-xl rounded-2xl border border-outline-variant hover:border-secondary/50 transition-colors">
             <h3 className="font-display text-title-lg text-on-background mb-6">Request a Personalized Demo</h3>
             <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label htmlFor="first_name" className="block text-label-md text-on-surface-variant mb-1">First Name</label>
                   <input id="first_name" type="text" placeholder="John" className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors" />
                 </div>
                 <div>
                   <label htmlFor="last_name" className="block text-label-md text-on-surface-variant mb-1">Last Name</label>
                   <input id="last_name" type="text" placeholder="Doe" className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors" />
                 </div>
               </div>
               <div>
                 <label htmlFor="work_email" className="block text-label-md text-on-surface-variant mb-1">Work Email</label>
                 <input id="work_email" type="email" placeholder="john@company.com" className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors" />
               </div>
               <div>
                 <label htmlFor="company_size" className="block text-label-md text-on-surface-variant mb-1">Company Size</label>
                 <select id="company_size" className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors appearance-none">
                   <option>1-50 Employees</option>
                   <option>51-200 Employees</option>
                   <option>201+ Employees</option>
                 </select>
               </div>
               <button 
                  type="submit"
                  className="w-full bg-secondary text-on-secondary py-4 rounded-xl font-bold text-title-md hover:bg-secondary/90 transition-colors shadow-md mt-2"
                >
                  Submit Request
                </button>
             </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-2xl px-margin-mobile md:px-margin-desktop max-w-[1440px] mx-auto">
        <div className="bg-primary-container rounded-2xl p-xl md:p-2xl text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="relative z-10">
            <h2 className="font-display text-headline-lg text-on-primary-container mb-sm">Explore The Platform</h2>
            <p className="font-display text-body-lg text-on-primary-container/80 max-w-[42rem] mx-auto mb-lg">
              Experience user tracking, session analytics, journey visualization, and heatmap analysis in a complete behavioral analytics workflow.
            </p>
            <div className="flex flex-wrap justify-center gap-md">
              <Link to="/sessions" className="bg-surface text-primary font-display text-title-md px-8 py-3 rounded-lg hover:bg-surface-variant transition-colors shadow-lg">
                Open Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="bg-surface-container-lowest dark:bg-surface-container-low border-t border-outline-variant w-full py-xl text-center">
         <p className="font-display text-body-md text-on-surface-variant">© 2026 TrackForge Analytics. All rights reserved.</p>
      </footer>
    </div>
  );
}
