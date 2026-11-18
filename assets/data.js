// Synthetic, non-personal prototype content; not official departments or endpoints.
export const departments = [
 {id:'civil',name:'Civil registration',icon:'identity',description:'Identity documents, certificates and registration journeys.'},
 {id:'transport',name:'Transport & mobility',icon:'car',description:'Vehicle and driving-related service journeys.'},
 {id:'local',name:'Local government',icon:'building',description:'Municipal accounts and neighbourhood service requests.'},
 {id:'business',name:'Business & enterprise',icon:'briefcase',description:'Business registration and enterprise support journeys.'},
 {id:'education',name:'Education & skills',icon:'book',description:'Learning opportunities and support applications.'},
 {id:'community',name:'Community support',icon:'people',description:'Support information and community assistance journeys.'},
];
export const services = [
 {id:'identity',name:'Identity document',department:'civil',category:'Identity & family',description:'Explore a guided identity-document request.',icon:'identity',fee:0},
 {id:'certificate',name:'Civil certificate',department:'civil',category:'Identity & family',description:'Preview a civil registration certificate request.',icon:'file',fee:0},
 {id:'vehicle',name:'Vehicle licence renewal',department:'transport',category:'Transport',description:'Walk through a vehicle licence renewal journey.',icon:'car',fee:250},
 {id:'municipal',name:'Municipal account',department:'local',category:'Local services',description:'Review an illustrative account balance and payment.',icon:'building',fee:480},
 {id:'report',name:'Report a local issue',department:'local',category:'Local services',description:'Try reporting a sample streetlight or road issue.',icon:'pin',fee:0},
 {id:'business',name:'Business registration',department:'business',category:'Business',description:'Explore a proposed business registration journey.',icon:'briefcase',fee:0},
 {id:'education',name:'Learning support',department:'education',category:'Education',description:'Preview an application for learning assistance.',icon:'book',fee:0},
 {id:'support',name:'Community assistance',department:'community',category:'Community',description:'Explore a community support enquiry.',icon:'people',fee:0},
];
export const initialApplications = [
 {id:'DEMO-1001',service:'identity',status:'In review',date:'2026-11-16',type:'Renewal',channel:'Portal inbox'},
 {id:'DEMO-1002',service:'vehicle',status:'Action needed',date:'2026-11-14',type:'Renewal',channel:'Portal inbox'},
 {id:'DEMO-1003',service:'education',status:'Completed',date:'2026-11-10',type:'New request',channel:'Portal inbox'},
];
export const messages = [
 {id:'MSG-01',title:'Your identity request is in review',department:'Civil registration',date:'16 Nov 2026',body:'Sample request DEMO-1001 is being reviewed. This demonstrates how an update could arrive in your OneNam inbox. No real application has been received.',application:'DEMO-1001'},
 {id:'MSG-02',title:'A sample payment is ready to review',department:'Transport & mobility',date:'14 Nov 2026',body:'The vehicle renewal example includes an illustrative N$250 balance. Explore the simulator without entering financial information. No money will move.',application:'DEMO-1002'},
 {id:'MSG-03',title:'Welcome to your sample workspace',department:'OneNam pilot',date:'10 Nov 2026',body:'Try opening a request, reviewing a balance or switching to the staff workspace. All records are synthetic and local to this browser tab.'},
];
export const notices = [
 {id:'gateway',tag:'Pilot update',title:'A more connected service experience',date:'18 Nov 2026',summary:'Explore the redesigned directory and sample workspaces.',body:'OneNam brings service discovery, citizen journeys, staff operations and a payment simulator into one consistent interface. This demonstrates a possible experience, not a live government service.'},
 {id:'offline',tag:'Using OneNam',title:'Keep public guidance within reach',date:'18 Nov 2026',summary:'Public information can be saved for limited connectivity.',body:'Visit online and wait for the offline-ready message. Public guidance and notices can then be read offline. Citizen, staff and payment workspaces are deliberately excluded from the offline cache.'},
 {id:'safe',tag:'Pilot guidance',title:'Explore safely with sample information',date:'18 Nov 2026',summary:'No identity documents, bank details or personal records are needed.',body:'Use preset choices throughout the demonstration. Sign-in, official applications, department communications and payments remain unavailable until verified operators and providers are configured.'},
];
export const invoices = [
 {id:'INV-101',title:'Vehicle licence renewal',department:'Transport & mobility',reference:'DEMO-1002',amount:250},
 {id:'INV-102',title:'Municipal account',department:'Local government',reference:'SAMPLE-ACCOUNT',amount:480},
];
export const money = value => `N$${Number(value).toFixed(2)}`;
