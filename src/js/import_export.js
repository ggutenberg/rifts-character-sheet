(function () {
  function getRepeatingRows(section, callback) {
    getSectionIDs(section, (ids) => {
      const attrNames = ids.reduce((acc, id) => {
        SECTIONS[section].forEach((key) => {
          acc.push(`repeating_${section}_${id}_${key}`);
        });
        return acc;
      }, []);
      getRepeatingSectionArray(section, ids, attrNames, callback);
    });
  }

  function getRepeatingSectionArray(section, rowIds, attrNames, callback) {
    let sectionArray = [];
    getAttrs(attrNames, (attrs) => {
      rowIds.forEach((rowId) => {
        const wpObj = Object.keys(attrs).reduce((acc, attr) => {
          if (attr.includes(rowId)) {
            acc[attr.replace(`repeating_${section}_${rowId}_`, "")] =
              attrs[attr];
          }
          return acc;
        }, {});
        sectionArray.push(wpObj);
      });
      callback(sectionArray);
    });
  }

  on("clicked:export", (e) => {
    console.log("export", e);
    const attrs = {};
    getRepeatingRows("wp", (wpSectionArray) => {
      attrs.wp = wpSectionArray;

      getRepeatingRows("wpmodern", (wpmodernSectionArray) => {
        attrs.wpmodern = wpmodernSectionArray;

        getRepeatingRows("skills", (skillsSectionArray) => {
          attrs.skills = skillsSectionArray;

          getRepeatingRows("combat", (combatSectionArray) => {
            attrs.combat = combatSectionArray;

            getRepeatingRows("magic", (magicSectionArray) => {
              attrs.magic = magicSectionArray;

              getRepeatingRows("psionics", (psionicsSectionArray) => {
                attrs.psionics = psionicsSectionArray;

                getRepeatingRows("movement", (movementSectionArray) => {
                  attrs.movement = movementSectionArray;

                  getAttrs(CORE_KEYS, (coreAttrs) => {
                    Object.entries(coreAttrs).forEach(
                      ([key, val]) => (attrs[key] = val)
                    );

                    setAttrs({ importexport: JSON.stringify(attrs, null, 2) });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  function setRepeatingRows(section, data, callback) {
    console.log("setRepeatingRows", section, data);
    if (!data) return callback();
    console.log("continuing setRepeatingRows", section);
    const attrs = data.reduce((acc, row) => {
      const rowId = generateRowID();
      Object.entries(row).forEach(([key, val]) => {
        acc[`repeating_${section}_${rowId}_${key}`] = val;
      });
      return acc;
    }, {});
    setAttrs(attrs, {}, callback);
  }

  on("clicked:import", (e) => {
    console.log("import", e);
    getAttrs(["importexport"], (a) => {
      const data = JSON.parse(a.importexport);
      console.log(data);
      setRepeatingRows("wp", data.wp, () => {
        delete data.wp;
        setRepeatingRows("wpmodern", data.wpmodern, () => {
          delete data.wpmodern;
          setRepeatingRows("skills", data.skills, () => {
            delete data.skills;
            setRepeatingRows("modifiers", data.modifiers, () => {
              delete data.modifiers;
              setRepeatingRows("magic", data.magic, () => {
                delete data.magic;
                setRepeatingRows("psionics", data.psionics, () => {
                  delete data.psionics;
                  setRepeatingRows("movement", data.movement, () => {
                    delete data.movement;
                    setAttrs(data);
                  });
                });
              });
            });
          });
        });
      });
    });
  });
})();
