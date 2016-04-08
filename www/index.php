<html>
   <head>
      <script src="/js/jquery-2.0.3.min.js"></script>
      <script src="/js/system2.js"></script>
      <script src="/js/utils.js"></script>
      <script src="js/db.js"></script>
      <script src="js/item.js"></script>

      <script src="bisbuilder.js"></script>

      <link type="text/css" rel="stylesheet" href="css/bisbuilder.css">
      <link type="text/css" rel="stylesheet" href="css/eqitem.css">
   <head>

   <body>
      <div class="inventory">
         <div class="inv-slot ear1" slotID="18"><div class="slot-content"></div></div>
         <div class="inv-slot head" slotID="4"><div class="slot-content"></div></div>
         <div class="inv-slot face" slotID="8"><div class="slot-content"></div></div>
         <div class="inv-slot ear2" slotID="19" adjust="-1"><div class="slot-content"></div></div>
         <div class="inv-slot chest" slotID="131072"><div class="slot-content"></div></div>
         <div class="inv-slot neck" slotID="32"><div class="slot-content"></div></div>
         <div class="inv-slot arms" slotID="128"><div class="slot-content"></div></div>
         <div class="inv-slot back" slotID="256"><div class="slot-content"></div></div>
         <div class="inv-slot waist" slotID="1048576"><div class="slot-content"></div></div>
         <div class="inv-slot shoulders" slotID="64"><div class="slot-content"></div></div>
         <div class="inv-slot wrist1" slotID="1536"><div class="slot-content"></div></div>
         <div class="inv-slot wrist2" slotID="1537" adjust="-1"><div class="slot-content"></div></div>
         <div class="inv-slot legs" slotID="262144"><div class="slot-content"></div></div>
         <div class="inv-slot hands" slotID="4096"><div class="slot-content"></div></div>
         <div class="inv-slot feet" slotID="524288"><div class="slot-content"></div></div>
         <div class="inv-slot ring1" slotID="98304"><div class="slot-content"></div></div>
         <div class="inv-slot ring2" slotID="98305" adjust="-1"><div class="slot-content"></div></div>
         <div class="inv-slot primary" slotID="8192"><div class="slot-content"></div></div>
         <div class="inv-slot secondary" slotID="16384"><div class="slot-content"></div></div>
         <div class="inv-slot range" slotID="2048"><div class="slot-content"></div></div>
         <div class="inv-slot ammo" slotID="2097152"><div class="slot-content"></div></div>
      </div>

      <div class="picker">
         <div class="group controls">
            <span class="link new">new</span> | <span class="link save">save</span> | <span class="link delete">delete</span>
         </div>
         <div class="group info">
            <div class="label">Build:</div>
            <select id="allbuilds"></select>
            <div class="author">&nbsp;</div>
         </div>

         <div class="group classinfo">
            <div class="label">Race:</div>
            <select id="race"></select>
            <div class="label">Class:</div>
            <select id="class"></select>
         </div>

         <br>

         <div class="group item">
            <div class="label">Available Items:</div>
            <div class="searchresults">
               <select size=10 id="searchresults"></select>
            </div>
            <div><input id="item" placeholder="filter..."></input></div>
         </div>

         <div class="group auth">
            <div class="label">Author Code:</div>
            <input id="author-code"></input>
            <span class="link be-author">get an author code</span>
         <div>

      </div>


   </body>

   <script type="text/javascript">
      var loadDetails = <?php echo json_encode($_GET) ?>;
   </script>

</html>