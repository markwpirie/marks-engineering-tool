// ══════════════════════════════════════════════════════════
// GLAND DATA — Hawke datasheets
// ══════════════════════════════════════════════════════════

// 501/453/UNIV — coldflow, armoured (FIRST)
const GLAND_453 = [
  { size:'Os', metric:'M16/M20', npt:'½"',         innerMin:3.5,  innerMax:8.1,  outerMin:5.5,  outerMax:12.0, arm1:'0.8/1.25', arm2:'0.0/0.8' },
  { size:'O',  metric:'M16/M20', npt:'½"',         innerMin:6.5,  innerMax:11.4, outerMin:9.5,  outerMax:16.0, arm1:'0.8/1.25', arm2:'0.0/0.8' },
  { size:'A',  metric:'M20',     npt:'¾" or ½"',   innerMin:8.4,  innerMax:14.3, outerMin:12.5, outerMax:20.5, arm1:'0.8/1.25', arm2:'0.0/0.8' },
  { size:'B',  metric:'M25',     npt:'1" or ¾"',   innerMin:11.1, innerMax:19.7, outerMin:16.9, outerMax:26.0, arm1:'1.25/1.6', arm2:'0.0/0.7' },
  { size:'C',  metric:'M32',     npt:'1¼" or 1"',  innerMin:17.6, innerMax:26.5, outerMin:22.0, outerMax:33.0, arm1:'1.6/2.0',  arm2:'0.0/0.7' },
  { size:'C2', metric:'M40',     npt:'1½" or 1¼"', innerMin:23.1, innerMax:32.5, outerMin:28.0, outerMax:41.0, arm1:'1.6/2.0',  arm2:'0.0/0.7' },
  { size:'D',  metric:'M50',     npt:'2" or 1½"',  innerMin:28.9, innerMax:44.4, outerMin:36.0, outerMax:52.6, arm1:'1.8/2.5',  arm2:'0.0/1.0' },
  { size:'E',  metric:'M63',     npt:'2½" or 2"',  innerMin:39.9, innerMax:56.3, outerMin:46.0, outerMax:65.3, arm1:'1.8/2.5',  arm2:'0.0/1.0' },
  { size:'F',  metric:'M75',     npt:'3" or 2½"',  innerMin:50.5, innerMax:68.2, outerMin:57.0, outerMax:78.0, arm1:'1.8/2.5',  arm2:'0.0/1.0' },
  { size:'G',  metric:'M80',     npt:'3½"',        innerMin:67.0, innerMax:73.0, outerMin:75.0, outerMax:89.5, arm1:'2.0/3.5',  arm2:'0.0/1.0' },
  { size:'H',  metric:'M90',     npt:'3½"',        innerMin:67.0, innerMax:77.6, outerMin:75.0, outerMax:89.5, arm1:'2.0/3.5',  arm2:'0.0/1.0' },
  { size:'J',  metric:'M100',    npt:'4"',         innerMin:77.0, innerMax:91.6, outerMin:88.0, outerMax:104.5,arm1:'2.5/4.0',  arm2:'0.0/1.0' },
];

// ICG/653/UNIV — barrier gland (SECOND)
const GLAND_653 = [
  { size:'Os', metric:'M20',  npt:'½"',         innerMax:8.1,  coreMax:8.0,  outerMin:5.5,  outerMax:12.0, arm1:'0.8/1.25', arm2:'0.0/0.8' },
  { size:'O',  metric:'M20',  npt:'½"',         innerMax:11.7, coreMax:8.8,  outerMin:9.5,  outerMax:16.0, arm1:'0.8/1.25', arm2:'0.0/0.8' },
  { size:'A',  metric:'M20',  npt:'¾" or ½"',   innerMax:14.0, coreMax:10.8, outerMin:12.5, outerMax:20.5, arm1:'0.8/1.25', arm2:'0.0/0.8' },
  { size:'B',  metric:'M25',  npt:'1" or ¾"',   innerMax:19.9, coreMax:15.9, outerMin:16.9, outerMax:26.0, arm1:'1.25/1.6', arm2:'0.0/0.7' },
  { size:'C',  metric:'M32',  npt:'1¼" or 1"',  innerMax:26.2, coreMax:21.9, outerMin:22.0, outerMax:33.0, arm1:'1.6/2.0',  arm2:'0.0/0.7' },
  { size:'C2', metric:'M40',  npt:'1½" or 1¼"', innerMax:32.3, coreMax:26.7, outerMin:28.0, outerMax:41.0, arm1:'1.6/2.0',  arm2:'0.0/0.7' },
  { size:'D',  metric:'M50',  npt:'2" or 1½"',  innerMax:44.2, coreMax:37.7, outerMin:36.0, outerMax:52.6, arm1:'1.8/2.5',  arm2:'0.0/1.0' },
  { size:'E',  metric:'M63',  npt:'2½" or 2"',  innerMax:56.0, coreMax:49.0, outerMin:46.0, outerMax:65.3, arm1:'1.8/2.5',  arm2:'0.0/1.0' },
  { size:'F',  metric:'M75',  npt:'3" or 2½"',  innerMax:68.0, coreMax:59.8, outerMin:57.0, outerMax:78.0, arm1:'1.8/2.5',  arm2:'0.0/1.0' },
];

// 501/421 — compression, non-armoured (LAST)
const GLAND_421 = [
  { size:'2K', metric:'M16',  npt:'-',          stdMin:3.2,  stdMax:8.0,  altMin:null, altMax:null },
  { size:'Os', metric:'M20',  npt:'½"',         stdMin:3.2,  stdMax:8.0,  altMin:null, altMax:null },
  { size:'O',  metric:'M20',  npt:'½"',         stdMin:6.5,  stdMax:11.9, altMin:null, altMax:null },
  { size:'A',  metric:'M20',  npt:'¾" or ½"',   stdMin:10.0, stdMax:14.3, altMin:9.0,  altMax:13.4 },
  { size:'B',  metric:'M25',  npt:'1" or ¾"',   stdMin:13.0, stdMax:20.2, altMin:9.5,  altMax:15.4 },
  { size:'C',  metric:'M32',  npt:'1¼" or 1"',  stdMin:19.5, stdMax:26.5, altMin:15.5, altMax:21.2 },
  { size:'C2', metric:'M40',  npt:'1½" or 1¼"', stdMin:25.0, stdMax:32.5, altMin:22.0, altMax:28.0 },
  { size:'D',  metric:'M50',  npt:'2" or 1½"',  stdMin:31.5, stdMax:44.4, altMin:27.5, altMax:34.8 },
  { size:'E',  metric:'M63',  npt:'2½" or 2"',  stdMin:42.5, stdMax:56.3, altMin:39.0, altMax:46.5 },
  { size:'F',  metric:'M75',  npt:'3" or 2½"',  stdMin:54.5, stdMax:68.2, altMin:49.5, altMax:58.3 },
  { size:'G',  metric:'M80',  npt:'3½"',        stdMin:67.0, stdMax:73.0, altMin:null, altMax:null },
  { size:'H',  metric:'M90',  npt:'3½"',        stdMin:67.0, stdMax:77.6, altMin:null, altMax:null },
  { size:'J',  metric:'M100', npt:'4"',         stdMin:77.0, stdMax:91.6, altMin:null, altMax:null },
];

// Full Hawke order code format: 501/453/UNIV/SIZE/ENTRY
function getGlandOrderCode(type, size, entryType, entryVal) {
  if (type === '453') {
    // 501/453/UNIV/A/M20 or 501/453/UNIV/A/3-4NP
    const entry = entryType === 'npt' ? entryVal.replace('"','').replace('/','') + 'NP' : entryVal.replace('/','-');
    return `501/453/UNIV/${size}/${entry}`;
  } else if (type === '653') {
    const entry = entryType === 'npt' ? entryVal.replace('"','').replace('/','') + 'NP' : entryVal;
    return `ICG/653/UNIV/${size}/${entry}`;
  } else if (type === '421') {
    const entry = entryType === 'npt' ? entryVal.split(' ')[0].replace('"','').replace('/','') + 'NP' : entryVal;
    return `501/421/UNIV/${size}/${entry}`;
  }
  return '';
}
