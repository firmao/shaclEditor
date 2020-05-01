function clearForm(fields) {
    for (const field of fields) {
        document.getElementById(field).value = "";
    }
}

// Add any Map or Set to another
function addAll(target, source) {
    if (target instanceof Map) {
        Array.from(source.entries()).forEach(it => target.set(it[0], it[1]))
    } else if (target instanceof Set) {
        source.forEach(it => target.add(it))
    }
}