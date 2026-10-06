# Coolita OS: Web App Development Guide | PDF | World Wide Web | Internet & Web

**URL:** https://www.scribd.com/document/816863928/WebApp-for-Coolita-TV-2023-11-23

---

Control your privacy preferences
This website utilizes technologies such as cookies to enable essential site functionality, as well as for performance cookies, personalization, and targeted advertising. To learn more, view the following link:
Privacy Policy
Skip to main content
Search
Search
EN
CHANGE LANGUAGE, ENGLISH
Upload
Sign in
Download free for 30 days
0 ratings
0% found this document useful (0 votes)
599 views
5 pages

Coolita OS: Web App Development Guide

WebApp for Coolita TV-2023-11-23
Full description
Uploaded byreach.rabin.mahato

AI-enhanced title

Download
Save
Save WebApp for Coolita TV-2023-11-23 For Later
Share
0%
0% found this document useful, Mark this document as useful
0%
0% found this document not useful, Mark this document as not useful
Print
Embed
Ask AI
Report
Download
Save WebApp for Coolita TV-2023-11-23 For Later
Share
More options
Fullscreen
You are on page 1
5
Zoom out
Zoom in
 
WebApp for Coolita TV
Coolita is a flexible operating system based on Linux and Web to address the market
needs of large-screen OS solution include Smart TVs, Smart Projector, Smart dongle
etc. With Coolita, a device manufacturer can begin with configuration, modify it to
serve their own needs and quickly bring it to market.
Coolita integrated a Chrome Browser based on Chromium/Blink engine, which
supports latest W3C HTML5 specifications, supports Widevien/Playready DRM, thus
web apps for Coolita are basically very similar to standard web apps. If you have an
experience in building web apps, you can start developing web apps for Cooltia TV
easily, with your knowledge in standards-based web technologies, such as HTML,
CSS, and JavaScript.
1.
 Supported web API
: Below is information about using standard web API in
developing a web app for Coolita:
a.
 HTML, CSS, and JavaScript are the core web technologies to build web
pages or web apps. HTM
L presents th
e structure of the pages or the application
using markup and CSS formats the contents written in HTML such as colors,
layouts, font, etc. JavaScript is a programming language for the web which has
been standardized in the
 ECMAScript
. Using HTML5, CSS3, and JavaScript,
you can develop web apps for Coolita.
2.
 Browser engine
:
a.
 We provide the browser engines and their versions used on Coolita. Web
 App developer can check the compatible version of Chrome on
 Web APIs
 in
Browser compatibility of each API.
b.
 Browser engine version
 ：
Currently, Chromium 79 is used on Coolita.
We plan to introuduce and adapt Chromium 103 next year.
c.
 Browser engine features
：
Browser based on Chromium/Blink engine and
specially adapted for TV/STB. It can provide full support for HTML5.
i.
 Based on Blink rendering engine and Google V8 JavaScript engine
can quickly and stably display pages, load pictures and quickly execute
JavaScript extensions.
ii.
 Use OpenGL technology to accelerate the graphics processing ability.
iii.
 Standards:
1.
 HTML5 (Canvas 2D, Web Storage, Web Workers, Web Socket,
 Audio/Video Tags, SVG, etc.)
2.
 HTML4.01 (XHTML 1.1, XHTML Basic 1.1, CE-HTML, XML 1.1,
Ad
Download to read ad-free
 
RSS feed,etc.)
3.
 CSS3 (3D Transforms, CSS3 Animations & Transitions, CSS3
Media Queries and Selectors, CSS3 Opacity, CSS3 Outline, CSS3
Background), CSS1, CSS2.1
iv.
 Protocols : HTTP 1.0/1.1,HTTPS,SSL v3, TLS 1.0
v.
 Supported DRMs: Widevine L1, Playready SL3000
vi.
 Supported Streaming Protocols: HLS, MPEG-DASH
，
MSE(Media
Source Extensions) , EME(Encrypted Media Extensions)
3.
 Cookie and cache support of browser engine
a.
 The browser engine supports cookies and saves cache for enhanced
performance. The stored cache is used only while the web browser engine is
running and is not used anymore once an app has been terminated.
4.
 User Agent string
：
a.
 A web app can get the string from navigator.userAgent. The same string is
included in the HTTP request User-Agent header. The
 userAgent
 string that
corresponds to the browser engine is as follows:
i.
 UserAgent
：
Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36
(KHTML, like Gecko) Chrome/88.99.234.5 Safari/537.36 Coolita OS
QJY/2.0
5.
 The difference between Web Apps on PC and TV.
a.
 User operation mode
：
i.
 PC mode
：
 In PC usage scenarios, web apps or websites are
opened through a PC browser and operated with a mouse;
ii.
 TV mode
：
In TV usage scenarios, web apps or websites are opened
through a browser and typically operated and selected through the
directional keys on the remote control;
iii.
 Examples
：
1.
 PC mode: https://www.mxplayer.in/ link is for PC use, and
support mouse to operate. This link already worked in coolita browser,
but mouse operation mode is not friendly for TV users.
2.
 TV mode: support 5-key operate( OK/Enter, arrow keys: up,
down ,left , right), it will suit TV users. Below are some typical TV
mode web apps:
a.
 https://app.plex.tv/tv-v5-generic?platform=skyworth
b.
https://tv.iq.com/
c.
http://tv.deezer.com/smarttv/622973e257290b8d68de0ddb873fc
c30/foxxum/
Ad
Download to read ad-free
 
b.
 Hardware resource:
Unlike PC environments, embedded systems have limited hardware
resources, especially memory resources. It was recommended that the
memory usage of the web application layer be within 200MB. The less
memory occupied, the smoother the program runs.
i.
 UI resolution(pixel) : 1280x720.
6.
 HTML5 app links to integrate on Coolita
Same as the standard Web App, the actual content of the app resides on the
remote web server, you can update the content, including code for new features, at
any time without having to worry about pushing updates to devices.
When a user launches the local app on their device, the URL of the app is redirected
to the web app on the web server, and the resources are downloaded from the server 
to the device.
Step by step guide on how the process of link sharing, integration, and future
analytics/updates looks like
•
 Content/App Provider provide us the H5 URL, test account(if need), add our IP
into whitelist(if need). In additional, We have VPN network to simulate the real
network enviroment.
•
 Coolita R&D team will adapt to the H5 app, include test and address the issue.
If issues need Content provider to fix, we will provide the issue list and cause
•
 Once issues are fixed, Coolita QA team will test and confirm.
•
 When App reach the release standard, Coolita Commercial team will contact
with App provider(if need), Coolita Operator team will put the App url link to Coolita
operator server, then home/Launcher of the TV will show the App for the end user to
select and use.
•
 In addition, Coolita OS also support to show the contents' poster of the App on
TV's home/launcher for the end user to browser and watch the movie. This feature
requires App provider provide the metadata through API.
7.
 HTML5 app links to integrate on Coolita
Ad
Download to read ad-free
 
•
 For information about specification for the Chrome Browser, please refer to
"
QJY Chrome TV Browser Introduction.pdf 
".
•
 The browser provided chromium standard key mapping for App developers. For 
detail information, please refer to "
QJY Browser KeyMap.pd
f"
•
 To enable browser in debugger mode, please refer to "
How to enable browser 
debugger mode (chrome remote).doc
"
•
 To get the values of a few parameters from the platform/os; like resolution,
scale, model, manufacturer, locale, region, network information, please refer to "
JavaScript usage of QJY SDK for deviceinfo.pdf 
"
•
 To exit the web application
，
 please call
 window.close()
 to exit and back to
home/launcher.
8.
 The Chromium debugger (web inspector)
•
 The Chromium debugger (web inspector) is disabled by default on production
devices. If engineers need to enable web inspectors
，
it requires a special software
version or debug tool.
9.
 Platform Security (hardware-secure boot, TEE
）
•
 The chip solution provider for this
platform is Amlogic. Secure OS is
developed by Amlogic. It is a secure
kernel that can be run in parallel with a
full featured rich operating system such
as Linux or Android on the same ARM
core.
•
 It uses ARM TrustZone technology
to protect trusted applications and any
secure peripherals from code running in
the rich OS.
•
 The implementation of Amlogic Secure OS has been reviewed by ARM.
•
 With Secure OS, trusted applications will be executed in the secure world while
rich OS is executed in the normal world. This means that even if the rich OS is rooted,
the hacker is still unable to access the secure world.
•
 Amlogic Secure OS is Global Platform compliant. Trusted Application developed
using Global Platform TEE API can be ported to Amlogic Secure OS platform easily.
•
 TEE Development Kit (TDK) is a development kit which can provide libraries
and demos for Trusted Application (TA) and Client Application (CA). Using TDK to
setup a Trusted Execution Environment (TEE), to develop Digital Rights
Ad
Download to read ad-free
Share this document
Share on Facebook, opens a new window
Share on LinkedIn, opens a new window
Share with Email, opens mail client
Copy link
Millions of documents at your fingertips, ad-free Subscribe with a free trial
You might also like
VIDAA Web App Development Guide
PDF
No ratings yet
VIDAA Web App Development Guide
61 pages
Free Intro Classes Day 01 Notes
PDF
No ratings yet
Free Intro Classes Day 01 Notes
5 pages
Ab 7
PDF
No ratings yet
Ab 7
90 pages
Advanced Web Technologies Overview
PDF
No ratings yet
Advanced Web Technologies Overview
8 pages
SA-MP Server Log Analysis
PDF
No ratings yet
SA-MP Server Log Analysis
1,657 pages
College Algebra (3rd Edition) PDF
PDF
No ratings yet
College Algebra (3rd Edition) PDF
9 pages
Greek Tragedy and Its Modern Echoes
PDF
No ratings yet
Greek Tragedy and Its Modern Echoes
6 pages
Figures of Speech Explained
PDF
No ratings yet
Figures of Speech Explained
3 pages
Installing ROKU Channel via ZIP File
PDF
No ratings yet
Installing ROKU Channel via ZIP File
6 pages
Quine-McCluskey Method Explained
PDF
No ratings yet
Quine-McCluskey Method Explained
19 pages
Request for Support: Brigada Eskwela 2025
PDF
No ratings yet
Request for Support: Brigada Eskwela 2025
2 pages
Bacterial Cell Morphology Overview
PDF
No ratings yet
Bacterial Cell Morphology Overview
22 pages
Application-Oriented Web Technologies Overview
PDF
No ratings yet
Application-Oriented Web Technologies Overview
33 pages
Tailoring Autocad Pid and Plant 3d
PDF
100% (4)
Tailoring Autocad Pid and Plant 3d
176 pages
Marlin DRM White Paper
PDF
100% (1)
Marlin DRM White Paper
9 pages
Finite Verbs and Sentence Combining Guide
PDF
No ratings yet
Finite Verbs and Sentence Combining Guide
3 pages
Overview of Chrome OS Features
PDF
No ratings yet
Overview of Chrome OS Features
19 pages
Building IoT with MQTT and Arduino
PDF
No ratings yet
Building IoT with MQTT and Arduino
47 pages
The Cross: Love, Forgiveness, Reconciliation
PDF
No ratings yet
The Cross: Love, Forgiveness, Reconciliation
2 pages
PRPL Certification Program Guide
PDF
No ratings yet
PRPL Certification Program Guide
13 pages
ParkIT Camera Programmer's Manual
PDF
No ratings yet
ParkIT Camera Programmer's Manual
58 pages
JTJ 2011 04
PDF
No ratings yet
JTJ 2011 04
48 pages
TrustPay Merchant API Integration Guide
PDF
No ratings yet
TrustPay Merchant API Integration Guide
17 pages
100068966
PDF
100% (1)
100068966
87 pages
Tizen Operating System Overview
PDF
No ratings yet
Tizen Operating System Overview
6 pages
JMACX
PDF
No ratings yet
JMACX
250 pages
Stapi SDK User Manual-1
PDF
No ratings yet
Stapi SDK User Manual-1
204 pages
Raspberry Pi Camera Installation Guide
PDF
No ratings yet
Raspberry Pi Camera Installation Guide
14 pages
AP Literature Prompts for The Stranger
PDF
No ratings yet
AP Literature Prompts for The Stranger
2 pages
Downtown Vocabulary and Activities
PDF
No ratings yet
Downtown Vocabulary and Activities
9 pages
English Level 2 Quiz on Comparatives
PDF
No ratings yet
English Level 2 Quiz on Comparatives
3 pages
Novatek NT96650 Processor Overview
PDF
No ratings yet
Novatek NT96650 Processor Overview
35 pages
Chrome OS Installation Guide
PDF
No ratings yet
Chrome OS Installation Guide
10 pages
DLNA Technical - Test Overview
PDF
No ratings yet
DLNA Technical - Test Overview
46 pages
ElementManagerManual PDF
PDF
0% (1)
ElementManagerManual PDF
422 pages
LabVIEW SDK Programming Manual
PDF
No ratings yet
LabVIEW SDK Programming Manual
25 pages
Cisco Digital Media Player 4400
PDF
No ratings yet
Cisco Digital Media Player 4400
6 pages
Understanding Narrative Point of View
PDF
No ratings yet
Understanding Narrative Point of View
3 pages
SW TM4C Tools Ug 2.1.0.12573
PDF
No ratings yet
SW TM4C Tools Ug 2.1.0.12573
42 pages
Raspberry Pi 4 Projects for Kids Guide
PDF
No ratings yet
Raspberry Pi 4 Projects for Kids Guide
252 pages
Aadhaar Enrollment Client Setup Guide
PDF
No ratings yet
Aadhaar Enrollment Client Setup Guide
2 pages
(Ebook) Servlet and JSP: A Tutorial by Kurniawan, Budi Isbn 9781771970273, 9781771970280, 1771970278, 1771970286
PDF
No ratings yet
(Ebook) Servlet and JSP: A Tutorial by Kurniawan, Budi Isbn 9781771970273, 9781771970280, 1771970278, 1771970286
68 pages
EZAnalyze Installation Guide
PDF
No ratings yet
EZAnalyze Installation Guide
2 pages
Ask Forum Project Report
PDF
No ratings yet
Ask Forum Project Report
71 pages
User Manual: RTSP Server
PDF
100% (1)
User Manual: RTSP Server
27 pages
Dahua HTTP API Documentation for IPC
PDF
No ratings yet
Dahua HTTP API Documentation for IPC
126 pages
Frontend SDE Intern Dashboard Project
PDF
No ratings yet
Frontend SDE Intern Dashboard Project
5 pages
Understanding Inheritance in C++
PDF
No ratings yet
Understanding Inheritance in C++
30 pages
jPOS EE
PDF
No ratings yet
jPOS EE
111 pages
Essential Reading for English Majors
PDF
100% (1)
Essential Reading for English Majors
1 page
Accelerometer and Gyro Selection Guide
PDF
100% (1)
Accelerometer and Gyro Selection Guide
21 pages
Arm Mali GPU Best Practices: Developer Guide
PDF
No ratings yet
Arm Mali GPU Best Practices: Developer Guide
104 pages
Morpho RD Service Integration Guide
PDF
No ratings yet
Morpho RD Service Integration Guide
17 pages
Writing An Alsa Driver PDF
PDF
No ratings yet
Writing An Alsa Driver PDF
84 pages
Computer Abbreviations Explained
PDF
No ratings yet
Computer Abbreviations Explained
24 pages
Tunisian Spiral Chart Project Report
PDF
No ratings yet
Tunisian Spiral Chart Project Report
83 pages
Freenove Raspberry Pi Tutorial Guide
PDF
No ratings yet
Freenove Raspberry Pi Tutorial Guide
321 pages
Drupal 8 Development Standards
PDF
No ratings yet
Drupal 8 Development Standards
16 pages
Cluster-Tilting Theory Overview
PDF
No ratings yet
Cluster-Tilting Theory Overview
1 page
eBay Auction Software Requirements
PDF
No ratings yet
eBay Auction Software Requirements
22 pages
Web Development Internship Report
PDF
No ratings yet
Web Development Internship Report
28 pages
Laudon-Traver Ec10 PPT Ch04
PDF
No ratings yet
Laudon-Traver Ec10 PPT Ch04
33 pages
DragonFace English
PDF
0% (1)
DragonFace English
26 pages
Tutorial
PDF
No ratings yet
Tutorial
272 pages
Android TV Box Setup and Troubleshooting Guide
PDF
No ratings yet
Android TV Box Setup and Troubleshooting Guide
10 pages
Industrial Training in Web Development
PDF
No ratings yet
Industrial Training in Web Development
55 pages
Internship Report: Backend Development at LSOYS
PDF
No ratings yet
Internship Report: Backend Development at LSOYS
14 pages
EDS Technical Reference Guide 9.1
PDF
No ratings yet
EDS Technical Reference Guide 9.1
90 pages
Android Memory and Process Management
PDF
No ratings yet
Android Memory and Process Management
9 pages
C++ to Java Code Converter Overview
PDF
No ratings yet
C++ to Java Code Converter Overview
44 pages
Tejas Giri: Frontend Engineer Profile
PDF
No ratings yet
Tejas Giri: Frontend Engineer Profile
1 page
Amlogic DLNA User Guide
PDF
No ratings yet
Amlogic DLNA User Guide
7 pages
DSP Audio Codec Framework Overview
PDF
No ratings yet
DSP Audio Codec Framework Overview
21 pages
OV7670 Dual Camera Module Application Notes
PDF
No ratings yet
OV7670 Dual Camera Module Application Notes
17 pages
OLEDs: Innovations in Lighting Applications
PDF
No ratings yet
OLEDs: Innovations in Lighting Applications
32 pages
Ecommerce Website Development Specs
PDF
No ratings yet
Ecommerce Website Development Specs
9 pages
ESP32 WebSocket Camera Control
PDF
No ratings yet
ESP32 WebSocket Camera Control
7 pages
Armino AVDK SDK User Guide
PDF
No ratings yet
Armino AVDK SDK User Guide
343 pages
EazeePOS Android Terminal Specifications
PDF
No ratings yet
EazeePOS Android Terminal Specifications
5 pages
Network Plus Glossary
PDF
No ratings yet
Network Plus Glossary
8 pages
Data Intensive Computing Overview
PDF
No ratings yet
Data Intensive Computing Overview
64 pages
IT Professional with 14+ Years Experience
PDF
No ratings yet
IT Professional with 14+ Years Experience
14 pages
UML Class Diagrams Structure Guide
PDF
No ratings yet
UML Class Diagrams Structure Guide
1 page
d2d Math Syllebus
PDF
No ratings yet
d2d Math Syllebus
5 pages
C1SE.57 ArchitectureDesign AIJF Ver1.1
PDF
No ratings yet
C1SE.57 ArchitectureDesign AIJF Ver1.1
34 pages
HD-3568S LCD Motherboard Overview
PDF
No ratings yet
HD-3568S LCD Motherboard Overview
21 pages
Arduino Embedded Systems Practical Guide
PDF
No ratings yet
Arduino Embedded Systems Practical Guide
26 pages
I/O System Concepts and Scheduling
PDF
No ratings yet
I/O System Concepts and Scheduling
5 pages
Digital Wallet System Project Overview
PDF
No ratings yet
Digital Wallet System Project Overview
10 pages
OpenSprinkler Pi v2.0 Setup Guide
PDF
No ratings yet
OpenSprinkler Pi v2.0 Setup Guide
7 pages
Documents
Computers
Internet & Web
Ad
Footer menu
Back to top
About
About Scribd, Inc.
Slideshare
Join our team!
Contact us
Support
Help / FAQ
Accessibility
Purchase help
AdChoices
Legal
Terms
Privacy
Copyright
Your Privacy Choices
Social
Instagram
Instagram
Facebook
Facebook
Pinterest
Pinterest
Get our free apps
Documents
Language:
English
Copyright © 2026 Scribd Inc.
We take content rights seriously. Learn more in our FAQs or report infringement here.