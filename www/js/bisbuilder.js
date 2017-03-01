var system = new _system({onSystemReady: function() {
   bisbuilder.construct();
}});


var bisbuilder = new function() {
   var bb = this;

   bb.authorCode = undefined;
   bb.inventory = undefined;
   bb.currentBuildData = undefined;
   bb.authorCode = utils.getCookie("authorCode");

   bb.construct = function() {
      bb.php = new system.base.phpCaller({url: "php/bisbuilder-actions.php"});
      bb.inventory = new bb._inventory();
      bb.picker = new bb._picker();
      $.when(bb.fetchAllBuilds()).done(function() {
         if (typeof loadDetails.showBuildID != "undefined") {

            bb.picker.selAllBuilds.val(loadDetails.showBuildID).trigger("change");
            //bb.fetchBuildByBuildID(loadDetails.showBuildID);
         }
      })
   }
   bb.fetchBuildByBuildID = function(buildID) {
      $.when(bb.php.go({data: {m:2, buildID: buildID}})).done(
         function(data) {
            bb.currentBuildData = data;
            bb.displayBuild(bb.currentBuildData);
         }
      );
   }
   bb.fetchBuildByBuildName = function(buildName) {
      $.when(bb.php.go({data: {m:1, buildName: buildName}})).done(
         function(data) {
            bb.currentBuildData = data;
            bb.displayBuild(bb.currentBuildData);
         }
      );
   }
   bb.displayBuild = function(buildData) {
      bb.clearBuild();

      buildData.items.forEach(function(slotData) {
         var invSlot = bb.inventory.getSlotBySlotID(slotData.slotID);
         invSlot.setEqitem(slotData.itemDetails);
      });

      bb.picker.ddClass.val(bb.currentBuildData.classID);
      bb.picker.ddRace.val(bb.currentBuildData.raceID);
      bb.picker.lblAuthor.text("Author: "+bb.currentBuildData.authorName);
   }
   bb.clearBuild = function() {
      bb.inventory.allSlots.forEach(function(s) {
         s.clear();
      });
      bb.picker.ddClass.val("");
      bb.picker.ddRace.val("");
      bb.picker.lblAuthor.html("&nbsp;");

   }
   bb.fetchAllBuilds = function() {
      return $.when(bb.php.go({data: {m:3}})).done( function(data) {
         bb.allBuilds = data;
         bb.renderAllBuilds();
      });
   }
   bb.renderAllBuilds = function() {
      bb.picker.selAllBuilds.empty()

      bb.allBuilds.forEach(function(b) {
         var newSel = $("<option>");
         newSel.attr("value", b.ID);
         newSel.prop("data", b)
         newSel.text(b.name);
         newSel.appendTo(bb.picker.selAllBuilds);
      })

      bb.picker.selAllBuilds.val("-1");
   }
   bb.createAuthor = function() {
      var authorName = prompt("Provide a name to be displayed with your builds:");
      if (authorName==null) return;

      $.when(bb.php.go({data:{m:7, authorName: authorName}})).done(function(data) {
         bb.picker.txtAuthorCode.val(data.generatedCode).trigger("change");
         prompt("Here is your authorID.\n\nDO NOT LOSE THIS.\n", data.generatedCode);

      });
   }
   bb.makeNewBuild = function() {
      var buildName = prompt("Build name?");
      if (buildName == null) return;

      $.when(bb.php.go({data:{m:6, buildName: buildName, authorCode: bb.authorCode}})).done(function(data) {
         console.log(data);
         if (data.error==1) {
            alert(data.message);
            return;
         }
         window.location = "?showBuildID="+data.buildID;
      });
   }
   bb.saveBuild = function() {
      var saveData = [];
      for (var i=0;i<bb.inventory.allSlots.length;i++) {
         var slot = bb.inventory.allSlots[i];
         var itemID = (typeof slot.eqitem == "undefined"?-1:slot.eqitem.data.itemID);
         saveData.push({
            slotID: slot.slotID,
            itemID: itemID
         });
      }

      $.when(bb.php.go({
         data: {
            m:5,
            buildID: bb.currentBuildData.ID,
            classID: bb.picker.ddClass.val(),
            raceID: bb.picker.ddRace.val(),
            slotData: saveData,
            authorCode: bb.authorCode
         }
      })).done(function(data) {
         alert("Saved.");
      })
   }

   // children
   bb._inventory = function(opts) {
      var inv = this;

      $.extend(this, {
      }, opts);

      inv.allSlots = [];
      inv.focusedSlot = undefined;

      inv.construct = function() {
         inv.body = $(document.body).children(".inventory");
         inv.makeSlotsFromElements();
      }

      inv.makeSlotsFromElements = function() {
         var allInvSlotElements = inv.body.find(".inv-slot");

         allInvSlotElements.each(function() {
            inv.allSlots.push( new inv._slot({body:$(this)}) )
         });
      }

      inv.getSlotBySlotID = function(slotID) {
         for (var i=0;i<inv.allSlots.length;i++) {
            if (inv.allSlots[i].slotID==slotID) return inv.allSlots[i];
         }
      }

      inv.focusSlot = function(slot) {
         inv.unfocusCurrentFocusedSlot();
         inv.focusedSlot = slot;
         inv.focusedSlot.body.toggleClass("focus", true);

         bb.picker.fetchSuggestionsForFocusedSlot();

         if (typeof inv.focusedSlot.eqitem == "undefined") {
            bb.picker.inpEditItem.val("");
            return;
         }


         bb.picker.inpEditItem.val(inv.focusedSlot.eqitem.data.name);
      }

      inv.unfocusCurrentFocusedSlot = function() {
         if (typeof inv.focusedSlot=="undefined") return;

         inv.focusedSlot.body.toggleClass("focus", false);
         inv.focusedSlot = undefined;
      }


      // children
      inv._slot = function(opts) {
         var slot = this;

         $.extend(this, {
            body: undefined,
            slotName: undefined,
         }, opts);

         inv.eqitem = undefined;

         slot.slotID = parseInt(slot.body.attr("slotID"));
         slot.realSlotID = slot.slotID; // will be adjusted later in construct
         slot.slotName = undefined; // do this later because we need realSlotID
         slot.divContent = slot.body.find(".slot-content");

         slot.construct = function() {
            var adjustValue = slot.body.attr("adjust");
            if (typeof adjustValue != "undefined") {
               slot.realSlotID += parseInt(adjustValue);
               console.log("new val", slot.realSlotID);
            }

            slot.body.on({click: slot.onBodyClicked});
            slot.slotName = eqdb.getSlotNameBySlotID(slot.realSlotID);
            slot.divContent.text(slot.slotName);
         }
         slot.getActualSlotValue = function() {
            return slot.realSlotID;
         }

         slot.setEqitem = function(itemDetails) {
            if (typeof slot.eqitem != "undefined") slot.eqitem.poof();

            slot.eqitem = new eqitem({
               data: itemDetails,
               previewer: slot.divContent,
               iconHolder: slot.divContent,
            });
         }
         slot.clear = function() {
            if (typeof slot.eqitem != "undefined") {
               slot.eqitem.poof();
               delete slot.eqitem;
            }
         }

         slot.onBodyClicked = function(event) {
            if (typeof bb.currentBuildData=="undefined") return;
            inv.focusSlot(slot);
         }

         slot.construct();
         return this;
      }

      inv.construct();
      return this;
   }

   bb._picker = function(otps) {
      var picker = this;

      picker.suggestedSlotItems = undefined;

      picker.construct = function() {
         picker.body = $(document.body).children(".picker");
         picker.initControls();

         picker.fillRaceClassDropdowns();
         picker.txtAuthorCode.val(bb.authorCode);
      }

      // events
      picker.onTxtAuthorCodeChanged = function(event) {
         utils.setCookie("authorCode", picker.txtAuthorCode.val().trim());
         bb.authorCode = picker.txtAuthorCode.val().trim();
      }
      picker.onLinkSaveClicked = function(event) {
         if (typeof bb.currentBuildData == "undefined") return;
         if (bb.authorCode.trim()=="") {
            alert("No author code present.");
            return;
         }
         bisbuilder.saveBuild();
      }
      picker.onLinkNewClicked = function(event) {
         if (bb.authorCode.trim() == "") {
            alert("No author code present.");
            return;
         }
         bisbuilder.makeNewBuild();
      }
      picker.onLinkDeleteClicked = function(event) {
         if (typeof bb.currentBuildData == "undefined") return;
         if (bb.authorCode.trim() == "") {
            alert("No author code present.");
            return;
         }

         $.when(
            bb.php.go({data: {m:8, buildID: bb.currentBuildData.ID, authorCode: bb.authorCode}})
         ).done(function(data) {
            if (data.error==0) {
               picker.selAllBuilds.find(":selected").remove();
               bb.clearBuild();
               picker.selAllBuilds.val("");
            } else {
               alert(data.message);
            }
            console.log(data);
         });
      }

      picker.initControls = function() {

         picker.txtAuthorCode = picker.body.find("input#author-code");
         picker.txtAuthorCode.on({"change": picker.onTxtAuthorCodeChanged})

         picker.linkBeAuthor = picker.body.find(".link.be-author");
         picker.linkBeAuthor.on({"click": bisbuilder.createAuthor});

         picker.linkSave = picker.body.find(".link.save");
         picker.linkSave.on({"click": picker.onLinkSaveClicked});

         picker.linkDelete = picker.body.find(".link.delete");
         picker.linkDelete.on({"click": picker.onLinkDeleteClicked});

         picker.linkNew = picker.body.find(".link.new");
         picker.linkNew.on({"click": picker.onLinkNewClicked});

         picker.lblViewing = picker.body.find(".viewing");
         picker.lblAuthor = picker.body.find("div.author");
         picker.selAllBuilds = picker.body.find("select#allbuilds");
         picker.selAllBuilds.on({"change": picker.onSelAllBuildsChanged});

         picker.ddClass = picker.body.find("select#class");
         picker.ddRace = picker.body.find("select#race");

         picker.inpEditItem = picker.body.find("input#item");
         picker.inpEditItem.on({"change": picker.onEditItemChanged});
         picker.selSearchResults = picker.body.find("select#searchresults");
         picker.selSearchResults.on({"change": picker.onSelSearchResultsChanged});
      }

      picker.fillRaceClassDropdowns = function() {
         for (i in eqdb.classTypeIDs) {
            if (i==65535) continue;
            var newOption = $("<option>");
            newOption.attr("value", i);
            newOption.text(eqdb.classTypeIDs[i].name);
            newOption.appendTo(picker.ddClass);
         }
         for (i in eqdb.raceTypeIDs) {
            if (i==65535 || i==65536) continue;
            var newOption = $("<option>");
            newOption.attr("value", i);
            newOption.text(eqdb.raceTypeIDs[i].name);
            newOption.appendTo(picker.ddRace);
         }

         picker.ddRace.val("");
         picker.ddClass.val("");
      }

      picker.fetchSuggestionsForFocusedSlot = function() {
         picker.selSearchResults.empty();
         picker.selSearchResults.append("<option>retrieving choices...</option>");
         $.when(bb.php.go({
            data: {m:4, slotID: bb.inventory.focusedSlot.realSlotID, classID: bb.picker.ddClass.val()}
         })).done(
            function(data) {
               picker.suggestedSlotItems = data.searchResults;
               picker.renderSuggestedSlotItems();
            }
         );
      }

      picker.renderSuggestedSlotItems = function() {
         picker.selSearchResults.empty();

         picker.suggestedSlotItems.forEach(function(i) {
            var newItem = $("<option>");

            newItem.text(i.name);
            newItem.attr("itemID", i.itemID);
            newItem.appendTo(picker.selSearchResults);
         });
      }

      picker.onSelSearchResultsChanged = function(event) {
         var selectedItemID = picker.selSearchResults.find(":selected").attr("itemID");

         var itemData = picker.suggestedSlotItems.filter(function(i) {
            return (i.itemID==selectedItemID)
         })[0];

         bb.inventory.focusedSlot.setEqitem(itemData);
      }

      picker.onSelAllBuildsChanged = function() {
         var selectedBuildData = picker.selAllBuilds.find(":selected").prop("data");
         bb.fetchBuildByBuildID(selectedBuildData.ID);
      }


      picker.construct();
      return this;
   }

   return this;
}

