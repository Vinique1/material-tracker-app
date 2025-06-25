import React from "react";

const MaterialInspectionReport = () => {
  const data = [
    ["1", "PIPE MET 316L 10S DN80 3\" EN10204/3.1", "metres", "12", "N/A", "EXCELLENT CONDITION"],
    ["2", "PIPE MET UNS S31803 160 DN150 6\"\nEN10204/3.1", "metres", "13.4", "N/A", '"'],
    ["3", "PIPE MET UNS S31803 80S DN50 2\"", "metres", "5.81", "N/A", '"'],
    ["4", "PIPE MET UNS S31803 120 DN100 4\"", "metres", "20.79", "N/A", '"'],
    ["5", "PIPE MET 316L 10S DN150 6\"", "metres", "11.3", "N/A", '"'],
    ["6", "PIPE MET 316L 10S DN80 3\"\nEN10204/3.1", "metres", "12.08", "N/A", '"'],
    ["7", "Seamless pipe BE SRL 4\" XXS A106B Table Y-1 EN10204/3.1", "metres", "12", "N/A", '"'],
    ["8", "Smls elbow 90LR 6\" S160 A815 UNS S31803/1.4462 EN10204/3.1", "pcs", "3", "N/A", '"'],
    ["9", "WN flange RF SMF 150LBS 2\" S10S A182F316/316L EN10204/3.1", "pcs", "2", "N/A", '"'],
    ["10", "WN flange RF SMF 1500LBS 2\" XXS A105N/A350LF2 EN10204/3.1", "pcs", "1", "N/A", '"'],
    ["11", "WN flange RF SMF 150LBS 8\" S10S A182F316/316L EN10204/3.1", "pcs", "1", "N/A", '"'],
    ["12", "WN flange RF SMF 150LBS 3\" S10S A182F316/316L EN10204/3.1", "pcs", "6", "N/A", '"'],
    ["13", "BL flange RF SMF 150LBS 1/2\" A182F316/316L EN10204/3.1", "pcs", "1", "N/A", '"'],
    ["14", "BL flange RF SMF 1500LBS 4\" A182F51/1.4462 EN10204/3.1", "pcs", "2", "N/A", '"'],
    ["15", "BL flange RF SMF 2500LBS 2\" A105N/A350LF2 EN10204/3.1", "pcs", "8", "N/A", '"'],
    ["16", "BL flange RF SMF 2500LBS 3/4\" A105N/A350LF2 EN10204/3.1", "pcs", "1", "N/A", '"'],
    ["17", "BL flange RF SMF 1500LBS 2\" A182F51/1.4462 EN10204/3.1", "pcs", "7", "N/A", '"'],
    ["18", "BL flange RF SMF 2500LBS 4\" A105N/A350LF2 EN10204/3.1", "pcs", "5", "N/A", '"'],
    ["19", "BL flange RF SMF 150LBS 1/2\" A182F316/316L EN10204/3.1", "pcs", "1", "N/A", '"'],
    ["20", "BL flange RF SMF 2500LBS 2\" A182F51/1.4462 EN10204/3.1", "pcs", "14", "N/A", '"'],
    ["21", "BL flange RF SMF 1500LBS 2\" A105N/A350LF2 EN10204/3.1", "pcs", "4", "N/A", '"'],
    ["22", "BL flange RF SMF 1500LBS 4\" A105N/A350LF2 EN10204/3.1", "pcs", "5", "N/A", '"'],
  ];

  return (
    <div className="p-6 text-sm font-sans border border-black max-w-screen-lg mx-auto bg-white shadow-md">
      <div className="text-center font-bold text-lg underline flex border border-black justify-between">
        <div className="border-r border-black w-40 flex justify-center items-center">
                         <img
                src="/Steve Logo.png"
                alt="Steve Integrated Logo"
                className="h-20 w-20"
              />
        </div>
        <div className="flex items-center justify-center">
        <p >MATERIAL RECEIVING <br/> INSPECTION REPORT</p>
        </div>
        <div className="flex">
            <div className="flex flex-col items-center justify-between border-l border-black text-xs w-[250px]">
            {[
                ['Contract No:', 'CW60925'],
                ['Sheet No:', '1'],
                ['Date:', '2025-06-17'],
                ['Doc No:', 'QMS/MIR/001'],
            ].map(([label, value], index) => (
                <div key={index} className="flex w-full border-b border-black last:border-0">
                <div className="w-[100px] border-r border-black p-[4px] text-sm text-left no-underline"><p className="no-underline">
                   {label} </p></div>
                <div className="flex-1 p-[4px] text-sm text-center">{value}</div>
                </div>
            ))}
            </div>
            <div className="border-l border-black w-40"></div>
        </div>
      </div>
      {/* <div className="mb-1 font-semibold">STEVE INTEGRATED TECH.</div> */}
      <div className="font-semibold  border-l border-r border-black flex justify-center items-center">PROJECT TITLE: GBARAN GAS CAP BLOWDOWN PROJECT PHASE 2</div>
      <div className=" font-semibold  border-r border-l border-t border-black">CLIENT: RENAISSANCE AFRICA ENERGY COMPANY</div>


      <table className="w-full border border-collapse border-black text-xs">
        <thead className="bg-gray-300 text-black">
          <tr>
            <th className="border border-black px-2 py-1">S/NO</th>
            <th className="border border-black px-2 py-1">ITEM DESCRIPTION</th>
            <th className="border border-black px-2 py-1">UOM</th>
            <th className="border border-black px-2 py-1">QTY</th>
            <th className="border border-black px-2 py-1">Mat. Sap No</th>
            <th className="border border-black px-2 py-1">INSPECTION REMARK</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
              {row.map((cell, j) => (
                <td key={j} className="border border-black px-2 py-1 whitespace-pre-wrap align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-r border-l border-b border-black text-xs w-full max-w-4xl">
            <div className="flex border-b border-black">
                <div className="w-[25%] border-r border-black"></div>
                <div className="flex-1 border-r border-black text-center font-bold p-1">RECEIVED BY (STEVE INTEGRATED)</div>
                <div className="flex-1 border-r border-black text-center font-bold p-1">WITNESSED BY (ZECH OIL)</div>
                <div className="flex-1 text-center font-bold p-1">APPROVED BY (RAEC)</div>
            </div>
            {[
                ['NAME:', 'VICTOR IKEH', '', ''],
                ['POSITION:', 'QAQC ENGINEER', '', ''],
                ['SIGNATURE:', '', '', ''],
                ['DATE:', '2025-06-17T00:00:00', '', ''],
            ].map(([label, col1, col2, col3], idx) => (
                <div key={idx} className="flex border-b border-black last:border-b-0">
                <div className="w-[25%] border-r border-black font-bold p-1">{label}</div>
                <div className="flex-1 border-r border-black p-1">{col1}</div>
                <div className="flex-1 border-r border-black p-1">{col2}</div>
                <div className="flex-1 p-1">{col3}</div>
                </div>
            ))}
     </div>
    </div>
  );
};

export default MaterialInspectionReport;
