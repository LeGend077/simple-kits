import { world, system, Player, EntityInventoryComponent, ItemStack } from "@minecraft/server";
import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";
import { QIDB } from "./QIDB.js";
const kitDB = new QIDB('kits_database')
kitDB.set('woodkit', [
    new ItemStack('minecraft:wooden_sword', 1),
    new ItemStack('minecraft:wooden_pickaxe', 1),
    new ItemStack('minecraft:torch', 8),
    new ItemStack('minecraft:apple', 10),
    new ItemStack('minecraft:oak_planks', 32)
])
kitDB.set('stonekit', [
    new ItemStack('minecraft:stone_sword', 1),
    new ItemStack('minecraft:stone_pickaxe', 1),
    new ItemStack('minecraft:torch', 8),
    new ItemStack('minecraft:cooked_mutton', 10),
    new ItemStack('minecraft:oak_planks', 32)
])
system.runInterval(() => {
    if (!world.getDynamicProperty('starter_kit')) {
        world.setDynamicProperty('starter_kit', 'woodkit')
    }
    world.getPlayers().forEach(player => {
        const inventory = player.getComponent('minecraft:inventory')
        const container = inventory.container
        if (!player.getDynamicProperty('firstSpawnInTheWorld')) {
            kitDB.get(world.getDynamicProperty('starter_kit')).forEach(item => {
                container.addItem(item)
            })
            player.setDynamicProperty('firstSpawnInTheWorld', true)
        }
        kitDB.keys().forEach(key => {
            player.getTags().forEach(tag => {
                if (tag === `give_kit:${key}`) {
                    kitDB.get(key).forEach(item => {
                        container.addItem(item)
                    })
                    player.removeTag(`give_kit:${key}`)
                }
            })
        })
    })
}, 1)
world.afterEvents.itemUse.subscribe(evd => {
    if (evd.source instanceof Player) {
        if (evd.itemStack.typeId === 'sk:kits_manager') {
            manageKits(evd.source)
        } else { return }
    } else { return }
})
function allKits(source) {
    const inventory = source.getComponent('minecraft:inventory')
    const container = inventory.container
    const allKitsForm = new ActionFormData()
    allKitsForm.title('All available kits')
    allKitsForm.body('Select a kit to view it and add it to your inventory.')
    kitDB.keys().forEach(key => {
        allKitsForm.button(`${key}`)
    })
    allKitsForm.show(source).then(res => {
        const { canceled, cancelationReason, selection } = res
        if (canceled) return;
        kitDB.get(kitDB.keys()[selection]).forEach(item => {
            container.addItem(item)
        })
    })
}
function createKit(source) {
    const inventory = source.getComponent('minecraft:inventory')
    const container = inventory.container
    const items = []
    for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i)
        if (item && !(item.typeId === 'sk:kits_manager')) {
            const setItem = item.clone()
            items.push(setItem)
        }
    }
    const createKitForm = new ModalFormData()
    createKitForm.title('Create a Kit')
    createKitForm.textField('Kit Name (No spaces, numbers or symbols are allowed. Uppercase letters will be lowercased to maintain consistency)', 'Example: mykit, woodenkit')
    createKitForm.toggle('Are you sure to create a kit using your current inventory items?')
    createKitForm.show(source).then(res => {
        const { canceled, cancelationReason, formValues } = res
        if (canceled) return;

        if (formValues[1] && formValues[0] !== '') {
            const key = formValues[0].toLowerCase()
            kitDB.set(key, items)
        } else {
            source.sendMessage('Kit Creation Canceled!')
        }
    })
}
function manageKits(source) {
    const manageKitsForm = new ActionFormData()
    manageKitsForm.title('Manage Kits')
    manageKitsForm.body('Manage all your world\'s kits.\nIt is advised not to delete starter kit to avoid errors.')
    manageKitsForm.button('Create a Kit')
    manageKitsForm.button('View All Kits')
    manageKitsForm.button('Delete a Kit')
    manageKitsForm.button('Set Starter Kit')
    manageKitsForm.button('Reset')
    manageKitsForm.show(source).then(res => {
        const { canceled, cancelationReason, selection } = res
        if (canceled) return;
        if (selection == 0) {
            createKit(source)
        } else if (selection == 1) {
            allKits(source)
        } else if (selection == 2) {
            deleteKit(source)
        } else if (selection == 3) {
            setStarterKit(source)
        } else if (selection == 4) {
            reset(source)
        }
    })
}
function reset(source) {
    const resetForm = new MessageFormData()
    resetForm.title('Reset Kits')
    resetForm.body('This will delete all custom kits and reset the starter kit to default!\nAll players online on the time of resetting will be given the default starter kit.')
    resetForm.button1('Reset')
    resetForm.button2('Cancel')
    resetForm.show(source).then(res => {
        if (res.canceled) return;
        if (res.selection === 0) {
            kitDB.clear()
            kitDB.set('woodkit', [
                new ItemStack('minecraft:wooden_sword', 1),
                new ItemStack('minecraft:wooden_pickaxe', 1),
                new ItemStack('minecraft:torch', 8),
                new ItemStack('minecraft:apple', 10),
                new ItemStack('minecraft:oak_planks', 32)
            ])
            kitDB.set('stonekit', [
                new ItemStack('minecraft:stone_sword', 1),
                new ItemStack('minecraft:stone_pickaxe', 1),
                new ItemStack('minecraft:torch', 8),
                new ItemStack('minecraft:cooked_mutton', 10),
                new ItemStack('minecraft:oak_planks', 32)
            ])
            world.setDynamicProperty('starter_kit', 'woodkit')
            world.getAllPlayers().forEach(player => {
                player.setDynamicProperty('firstSpawnInTheWorld', false)
            })
        } else if (res.selection === 1) {
            return;
        }
    })
}
function deleteKit(source) {
    const inventory = source.getComponent('minecraft:inventory')
    const container = inventory.container
    const deleteKitForm = new ModalFormData()
    deleteKitForm.title('Delete a Kit')
    deleteKitForm.dropdown('Select the Kit to delete:', kitDB.keys())
    deleteKitForm.toggle('Are you sure to delete this kit? (Cannot be undone)')
    deleteKitForm.show(source).then(res => {
        const { canceled, cancelationReason, formValues } = res
        if (canceled) return;

        if (formValues[1]) {
            kitDB.delete(kitDB.keys()[formValues[0]])
        } else {
            source.sendMessage('Kit Deletion Canceled!')
        }
    })
}
function setStarterKit(source) {
    const setStarterKitForm = new ModalFormData()
    setStarterKitForm.title('Set')
    setStarterKitForm.dropdown(`Current Starter Kit: ${world.getDynamicProperty('starter_kit')}`, kitDB.keys())
    setStarterKitForm.show(source).then(res => {
        const { canceled, cancelationReason, formValues } = res
        if (canceled) return;
        world.setDynamicProperty('starter_kit', kitDB.keys()[formValues[0]])
    })
}
system.afterEvents.scriptEventReceive.subscribe(evd => {
    const { id, message, sourceType, initiator, sourceBlock, sourceEntity } = evd;
    switch (id) {
        case 'sk:reset':
            kitDB.clear()
            kitDB.set('woodkit', [
                new ItemStack('minecraft:wooden_sword', 1),
                new ItemStack('minecraft:wooden_pickaxe', 1),
                new ItemStack('minecraft:torch', 8),
                new ItemStack('minecraft:apple', 10),
                new ItemStack('minecraft:oak_planks', 32)
            ])
            kitDB.set('stonekit', [
                new ItemStack('minecraft:stone_sword', 1),
                new ItemStack('minecraft:stone_pickaxe', 1),
                new ItemStack('minecraft:torch', 8),
                new ItemStack('minecraft:cooked_mutton', 10),
                new ItemStack('minecraft:oak_planks', 32)
            ])
            world.setDynamicProperty('starter_kit', 'woodkit')
            world.getAllPlayers().forEach(player => {
                player.setDynamicProperty('firstSpawnInTheWorld', false)
            })
            break;
        case 'sk:manageKits':
            manageKits(sourceEntity)
            break;
        default:
            break;
    }
})