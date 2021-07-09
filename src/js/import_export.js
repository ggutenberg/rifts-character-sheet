(function () {
  async function getRepeatingSectionArrayAsync(section, rowIds, attrNames) {
    let sectionArray = [];
    const attrs = await getAttrsAsync(attrNames);
    rowIds.forEach((rowId) => {
      const wpObj = Object.keys(attrs).reduce((acc, attr) => {
        if (attr.includes(rowId)) {
          acc[attr.replace(`repeating_${section}_${rowId}_`, "")] = attrs[attr];
        }
        return acc;
      }, {});
      sectionArray.push(wpObj);
    });
    return sectionArray;
  }

  async function getRepeatingRowsAsync(section) {
    const ids = await getSectionIDsAsync(section);
    const attrNames = ids.reduce((acc, id) => {
      SECTIONS[section].forEach((key) => {
        acc.push(`repeating_${section}_${id}_${key}`);
      });
      return acc;
    }, []);
    const repeatingSectionArray = await getRepeatingSectionArrayAsync(
      section,
      ids,
      attrNames
    );
    return repeatingSectionArray;
  }

  on("clicked:export", async (e) => {
    console.log("export", e);
    const attrs = {};
    attrs.wp = await getRepeatingRowsAsync("wp");
    attrs.wpmodern = await getRepeatingRowsAsync("wpmodern");
    attrs.skills = await getRepeatingRowsAsync("skills");
    attrs.magic = await getRepeatingRowsAsync("magic");
    attrs.psionics = await getRepeatingRowsAsync("psionics");
    attrs.movement = await getRepeatingRowsAsync("movement");
    attrs.abilities = await getRepeatingRowsAsync("abilities");
    attrs.modifiers = await getRepeatingRowsAsync("modifiers");
    // Profiles are tricky to export because IDs that they refer to won't line up
    // attrs.profiles = await getRepeatingRowsAsync("profiles");
    const coreAttrs = await getAttrsAsync(CORE_KEYS);
    Object.entries(coreAttrs).forEach(([key, val]) => (attrs[key] = val));
    await setAttrsAsync({ importexport: JSON.stringify(attrs, null, 2) });
  });

  async function setRepeatingRowsAsync(section, data) {
    console.log("setRepeatingRows", section, data);
    if (!data) return;
    console.log("continuing setRepeatingRows", section);
    const attrs = data.reduce((acc, row) => {
      const rowId = generateRowID();
      Object.entries(row).forEach(([key, val]) => {
        acc[`repeating_${section}_${rowId}_${key}`] = val;
      });
      return acc;
    }, {});
    await setAttrsAsync(attrs);
  }

  on("clicked:import", async (e) => {
    console.log("import", e);
    await setAttrsAsync({ importexportstatus: "Importing..." });
    const a = await getAttrsAsync(["importexport"]);
    const data = JSON.parse(a.importexport);
    console.log(data);
    await setRepeatingRowsAsync("wp", data.wp);
    delete data.wp;
    await setRepeatingRowsAsync("wpmodern", data.wpmodern);
    delete data.wpmodern;
    await setRepeatingRowsAsync("skills", data.skills);
    delete data.skills;
    await setRepeatingRowsAsync("magic", data.magic);
    delete data.magic;
    await setRepeatingRowsAsync("psionics", data.psionics);
    delete data.psionics;
    await setRepeatingRowsAsync("movement", data.movement);
    delete data.movement;
    await setRepeatingRowsAsync("abilities", data.abilities);
    delete data.abilities;
    await setRepeatingRowsAsync("modifiers", data.modifiers);
    delete data.modifiers;
    await setAttrsAsync(data);
    // Done isn't actually true until everything is using async and no more callbacks
    await setAttrsAsync({ importexportstatus: "Done Importing!" });
  });
})();
