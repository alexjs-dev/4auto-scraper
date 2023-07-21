const tags = {
  luxury: "luxury",
  sport: "sport",
  reliable: "reliable",
};

const modelTags = {
  mercedes: {
    s: [tags.luxury],
    cls: [tags.luxury],
    gl: [tags.luxury],
    glk: [tags.luxury],
    gle: [tags.luxury],
    gls: [tags.luxury],
  },
  audi: {
    a8: [tags.luxury],
    a7: [tags.luxury],
    r8: [tags.sport],
    rs: [tags.sport],
    tt: [tags.sport],
    ttrs: [tags.sport],
    ttr: [tags.sport],
    rsq3: [tags.sport],
    a5: [tags.sport],
  },
  bmw: {
    7: [tags.luxury],
    8: [tags.luxury],
    i8: [tags.luxury],
    i3: [tags.luxury],
    x7: [tags.luxury],
    x6: [tags.luxury],
    m3: [tags.sport],
    m4: [tags.sport],
    m5: [tags.sport],
    m6: [tags.sport],
    m8: [tags.sport],
    x5m: [tags.sport],
    x6m: [tags.sport],
    x7m: [tags.sport],
    z4: [tags.sport],
    z8: [tags.sport],
  },
};

module.exports = {
  tags,
  modelTags,
};
