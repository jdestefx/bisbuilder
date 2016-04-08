// requires system

var eqitem = function(opts) {
   var item = this;

   if (typeof opts.data.itemID == "undefined") return false;

   var defaults = {
      previewer: undefined,
      //iconBaseURL: "icons/item_",
      iconBaseURL: "http://www.magelocdn.com/images/eq/item_icones/item_",
      iconHolder: undefined,
   }; 
   item.settings = $.extend({}, defaults, opts);

   item.data = item.settings.data;
   item.popupbodyConstructed = false;
   item.settings.iconURL = item.settings.iconBaseURL+item.settings.data.icon+".png"

   item.construct = function() {
      item.body = system.parts.get("part[for='eqitem-body']");
      item.popupbody = system.parts.get("part[for='eqitem-popup-body']");
      item.body.text(item.data.name);
      if (typeof item.settings.previewer == "undefined") item.settings.previewer = item.body;
      item.settings.previewer.on({"mouseenter.eqitem": item.onMouseEnter});
      item.settings.previewer.on({"mouseleave.eqitem": item.onMouseLeave});
      item.setIcon();
   }

   // item event handlers
   item.onMouseOver = function(event) {
      //console.log("here");
   }
   item.onMouseEnter = function(event) {

      if (item.popupbodyConstructed==false) {

         item.popupbody.find(".name").text(item.data.name);

         item.setFlags();
         item.setSkill();
         item.setSlot();
         item.setDmgDelayAc();
         item.setStats();
         item.setEffects();
         item.setWeight();
         item.setClasses();
         item.setRaces();
         item.setSize();
         item.setRange();

         item.popupbodyConstructed = true;
      }

      item.popupbody.appendTo(document.body);
      item.popupbody.css({
         left: item.settings.previewer.offset().left + item.settings.previewer.width() + 5,
         top: item.settings.previewer.offset().top,
      });

      item.popupbody.show();
   }
   item.onMouseLeave = function(event) {
      item.popupbody.remove();
   }


   // item methods
   item.poof = function() {
      item.settings.previewer.off(".eqitem");
      item.settings.iconHolder.css({"background-image": "none"});
      item.body.remove();
      item.popupbody.remove();
      delete item;
   }
   item.setIcon = function() {
      if (typeof item.settings.iconHolder == "undefined") return;
      item.settings.iconHolder.css({"background-image": "url('"+item.settings.iconURL+"')"});
   }
   item.getType = function() {
      if (item.data.itemclass == 1 || item.data.itemclass == 2) return eqdb.itemClassIDs[item.data.itemclass].name;
      return eqdb.itemTypeIDs[item.data.itemtype].name;
   }
   item.getSlot = function() {
      var ret = "";

      if (item.data.slots==0) return;

      for (i in eqdb.slotTypeIDs) {
         if ((eqdb.slotTypeIDs[i].ID&item.data.slots)==eqdb.slotTypeIDs[i].ID) {ret += eqdb.slotTypeIDs[i].name + " "}
      }

      return ret;
   }
   item.setMods = function() {
      //if (item.data.manaregen != 0) item.popupbody.find(".mods").append("Attack 
   }
   item.setFlags = function() {
      if (item.data.magic == 1) item.popupbody.find(".mln").append("MAGIC ITEM&nbsp;&nbsp;");
      if (item.data.loregroup == -1) item.popupbody.find(".mln").append("LORE ITEM&nbsp;&nbsp;");
      if (item.data.nodrop == 0) item.popupbody.find(".mln").append("NO DROP ");
   }
   item.setSlot = function() {
      var content = item.popupbody.find(".slots");

      if (item.data.slots != 0) content.text("Slot: ");

      for (i in eqdb.slotTypeIDs) {
         if ((eqdb.slotTypeIDs[i].ID&item.data.slots)==eqdb.slotTypeIDs[i].ID) {content.append(eqdb.slotTypeIDs[i].name + " ")}
      }
   }
   item.setSkill = function() {
      var cont = item.popupbody.find(".skill-delay");
      if (item.data.itemtype >= 23 && item.data.itemtype <= 26) {
         cont.append(eqdb.itemTypeIDs[item.data.itemtype] + "&nbsp;&nbsp")
      } else if (item.data.slots != 0)  {
         if (typeof eqdb.weaponSkillTypeIDs[item.data.itemtype]!="undefined" && eqdb.weaponSkillTypeIDs[item.data.itemtype].describeInPopup==true) {
            cont.append("Skill: " + eqdb.weaponSkillTypeIDs[item.data.itemtype].name + "&nbsp;&nbsp");
         }
      }
      
      //if (cont.text() == "") cont.remove();
   }
   item.setDmgDelayAc = function() {
      var cont = item.popupbody.find(".dmg-bonus-ac");
      if (item.data.damage != "0") cont.append("DMG: " + item.data.damage + "&nbsp;&nbsp;");
      if (item.data.ac != 0) cont.append("AC: " + item.data.ac);
      if (cont.text() == "") cont.remove();

      cont = item.popupbody.find(".skill-delay");
      if (item.data.delay != "0") cont.append("Atk Delay: " + item.data.delay + "&nbsp;&nbsp;");
      if (cont.text() == "") cont.remove();
   }

   item.setStats = function() {
      var h = [];
      if (item.data.astr != 0) h.push("STR:&nbsp;"+(item.data.astr>0?"+":"") + item.data.astr);
      if (item.data.adex != 0) h.push("DEX:&nbsp;"+(item.data.adex>0?"+":"") + item.data.adex);
      if (item.data.asta != 0) h.push("STA:&nbsp;"+(item.data.asta>0?"+":"") + item.data.asta);
      if (item.data.acha != 0) h.push("CHA:&nbsp;"+(item.data.acha>0?"+":"") + item.data.acha);
      if (item.data.awis != 0) h.push("WIS:&nbsp;"+(item.data.awis>0?"+":"") + item.data.awis);
      if (item.data.aint != 0) h.push("INT:&nbsp;"+(item.data.aint>0?"+":"") + item.data.aint);
      if (item.data.aagi != 0) h.push("AGI:&nbsp;"+(item.data.aagi>0?"+":"") + item.data.aagi);
      item.popupbody.find(".stats").html(h.join("&nbsp;")+" ");

      h = [];
      if (item.data.hp != 0) h.push("HP:&nbsp;"+(item.data.hp>0?"+":"")+item.data.hp);
      if (item.data.mana != 0) h.push("MANA:&nbsp;"+(item.data.mana>0?"+":"")+ item.data.mana);
      item.popupbody.find(".stats").append(h.join("&nbsp;"));

      var s = [];
      if (item.data.fr != 0) s.push("SV&nbsp;FIRE&nbsp;+" + item.data.fr);
      if (item.data.dr != 0) s.push("SV&nbsp;DISEASE&nbsp;+" + item.data.dr);
      if (item.data.cr != 0) s.push("SV&nbsp;COLD&nbsp;+" + item.data.cr);
      if (item.data.mr != 0) s.push("SV&nbsp;MAGIC&nbsp;+" + item.data.mr);
      if (item.data.pr != 0) s.push("SV&nbsp;POISON&nbsp;+" + item.data.pr);
      item.popupbody.find(".saves").html( s.join("&nbsp;&nbsp;") );
   }
   item.setEffects = function() {
      //if (item.data.regen != 0) item.popupbody.find(".mods").append("HP Regen +"+item.data.regen);
      //if (item.data.haste != 0) item.popupbody.find(".effect").append("Effect: Haste (" + item.data.haste + ")<br>");
      if (item.data.proceffect != 0) item.popupbody.find(".effect").append("Effect: " + item.data.proceffect_name);
      if (item.data.worneffect != 0) item.popupbody.find(".effect").text("Worn Effect: " + item.data.worneffect_name);
      if (item.data.focuseffect != 0 && item.data.focuseffect != -1) item.popupbody.find(".effect").text("Focus Effect: " + item.data.focuseffect_name);
   }
   this.setWeight = function() {
      var cont = item.popupbody.find(".weight");
      if (item.data.weight != -1) cont.append("Weight: "+ item.data.weight / 10);
      if (item.data.weight/10 == parseInt(item.data.weight/10)) cont.append(".0");
      cont.append("&nbsp;");
   }
   item.setClasses = function() {
      var content = item.popupbody.find(".class");

      if (item.data.races == 0 && item.data.classes == 0) return;

      if (typeof eqdb.classUsageAbbreviations[item.data.classes] != "undefined") {
         content.text(eqdb.classUsageAbbreviations[item.data.classes].description);
         return;
      }

      item.popupbody.find(".class").append("Class: ");
      for (i in eqdb.classTypeIDs) {
         if ((eqdb.classTypeIDs[i].ID&item.data.classes)==eqdb.classTypeIDs[i].ID) {content.append(eqdb.classTypeIDs[i].abbrv + " ")}
      }
   }
   item.setSize = function() {
      var content = item.popupbody.find(".size");

      content.html("&nbsp;");
      if (item.data.size == 0) content.append("Size: TINY");
      if (item.data.size == 1) content.append("Size: SMALL");
      if (item.data.size == 2) content.append("Size: MEDIUM");
      if (item.data.size == 3) content.append("Size: LARGE");
      content.append("&nbsp;");
   }
   item.setRange = function() {
      if (item.data.itemtype == 5) {
         item.popupbody.find(".range").html("&nbsp;&nbsp;Range: "+item.data.range+"&nbsp;&nbsp;");
      }
   }
   item.setRaces = function() {
      var content = item.popupbody.find(".race");
      
      if (typeof eqdb.raceUsageAbbreviations[item.data.races]!="undefined") {
         content.html(eqdb.raceUsageAbbreviations[item.data.races].description);
         return;
      }

      content.html("Race: ");

      for (i in eqdb.raceTypeIDs) {
         if ((eqdb.raceTypeIDs[i].ID&item.data.races)==eqdb.raceTypeIDs[i].ID) {
            content.append(eqdb.raceTypeIDs[i].abbrv + " ")
         }
      } 
   }

   item.construct();
   return item;

}
