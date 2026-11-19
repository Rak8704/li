export const categories = ["Wall Decor","Lighting","Plants & Vases","Cushions & Textiles","Furniture","Kitchen & Dining"];
// Add real photos later: put files in /public/products and set image: "/products/name.jpg"
export const products = [
 {id:"arch-mirror",name:"Arched Gold Mirror",category:"Wall Decor",price:6800,old:8200,emoji:"🪞",tint:"#ead7b0",desc:"Slim brass-finish frame with a soft arch. Makes small rooms feel wider and brighter.",tags:["new"]},
 {id:"woven-wall",name:"Woven Jute Wall Hanging",category:"Wall Decor",price:2400,emoji:"🧶",tint:"#e3cfa5",desc:"Hand-woven jute with cotton fringe. Adds texture above a sofa or bed."},
 {id:"frame-set",name:"Gallery Frame Set (6)",category:"Wall Decor",price:3200,old:3900,emoji:"🖼️",tint:"#efe0c2",desc:"Six wooden frames in mixed sizes, ready to hang with a layout guide."},
 {id:"dome-lamp",name:"Terracotta Dome Pendant",category:"Lighting",price:4500,emoji:"💡",tint:"#e8c99a",desc:"Warm-glow pendant with a 1.5 m cord. Fits E27 bulbs.",tags:["best"]},
 {id:"table-lamp",name:"Linen Shade Table Lamp",category:"Lighting",price:3800,emoji:"🪔",tint:"#f0e2c4",desc:"Wooden base with a pleated linen shade. Soft light for bedside tables."},
 {id:"fairy-lights",name:"Warm Fairy Lights (10 m)",category:"Lighting",price:850,emoji:"✨",tint:"#f2e6c8",desc:"USB-powered string lights with 100 warm-white LEDs."},
 {id:"fiddle-pot",name:"Ceramic Planter with Stand",category:"Plants & Vases",price:2100,emoji:"🪴",tint:"#cfd9b4",desc:"Matte ceramic pot on a wooden stand. 22 cm opening with drainage.",tags:["best"]},
 {id:"bud-vases",name:"Stoneware Bud Vase Trio",category:"Plants & Vases",price:1600,emoji:"🏺",tint:"#e6d3b3",desc:"Three hand-glazed vases in sand, clay and moss."},
 {id:"pampas",name:"Dried Pampas Bundle",category:"Plants & Vases",price:950,emoji:"🌾",tint:"#efdfbf",desc:"Natural dried stems, 70 cm. No watering, lasts for years.",tags:["new"]},
 {id:"cushion-set",name:"Boucle Cushion Cover Set (2)",category:"Cushions & Textiles",price:1800,emoji:"🛋️",tint:"#f1e4cc",desc:"Soft boucle covers, 45×45 cm, hidden zip. Machine washable."},
 {id:"throw",name:"Waffle Cotton Throw",category:"Cushions & Textiles",price:2900,old:3400,emoji:"🧣",tint:"#e9d6b4",desc:"Light 130×170 cm throw for sofas and beds in every season."},
 {id:"rug",name:"Handloom Cotton Rug 5×7",category:"Cushions & Textiles",price:7400,emoji:"🟫",tint:"#dcc193",desc:"Flat-weave cotton rug with a fringed edge. Easy to shake clean."},
 {id:"armchair",name:"Cream Accent Armchair",category:"Furniture",price:24500,old:27900,emoji:"🪑",tint:"#f0e0c0",desc:"Curved back, solid wood legs, high-density foam seat.",tags:["best"]},
 {id:"side-table",name:"Round Oak Side Table",category:"Furniture",price:8900,emoji:"🟤",tint:"#dfc196",desc:"50 cm solid oak top with a slim black metal base."},
 {id:"shelf",name:"Floating Shelf Pair",category:"Furniture",price:2600,emoji:"📚",tint:"#e7d2aa",desc:"Two 60 cm shelves with hidden brackets. Holds up to 10 kg each."},
 {id:"dinner-set",name:"Stoneware Dinner Set (16 pcs)",category:"Kitchen & Dining",price:7900,emoji:"🍽️",tint:"#ecdcbc",desc:"Plates and bowls for four in a reactive speckle glaze. Dishwasher safe."},
 {id:"bamboo-tray",name:"Bamboo Serving Tray",category:"Kitchen & Dining",price:1400,emoji:"🥢",tint:"#e4d09f",desc:"Handled tray, 40×28 cm, with a food-safe finish."},
 {id:"candles",name:"Soy Candle Trio",category:"Kitchen & Dining",price:1950,emoji:"🕯️",tint:"#f3e5c6",desc:"Vanilla, sandalwood and jasmine. 40 hours burn time each.",tags:["new"]}
];
export const taka = n => "৳" + n.toLocaleString("en-IN");
